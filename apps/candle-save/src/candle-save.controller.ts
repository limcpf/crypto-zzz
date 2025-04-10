import {CoinLogger} from "@libs/logger/coin-logger";
import {MessageKey} from "@libs/messages/message-keys";
import {MessageService} from "@libs/messages/message.service";
import {RedisService} from "@libs/redis";
import {Controller, OnModuleInit} from "@nestjs/common";
import {CandleSaveService} from "./candle-save.service";

@Controller()
export class CandleSaveController implements OnModuleInit {
	private readonly STREAM = "candle";
	private readonly GROUP = "candle-save";
	private readonly CONSUMER = process.env.CONSUMER || "consumer-1";

	constructor(
		private readonly redisService: RedisService,
		private readonly candleSaveService: CandleSaveService,
		private readonly logger: CoinLogger,
		private readonly messageService: MessageService,
	) {}

	async onModuleInit() {
		try {
			await this.redisService.xgroup(this.STREAM, this.GROUP);
		} catch (err) {
			console.log(err);
		}

		await this.startConsumer();
	}

	private async startConsumer() {

		// biome-ignore lint(infinite-loop)
		// noinspection InfiniteLoopJS
		while (true) {
			try {
				const results = await this.redisService.xreadgroup(
					this.GROUP,
					this.CONSUMER,
					{ candle: ">" }, // ">" 는 마지막으로 처리된 ID 이후의 메시지만 가져옴
					1,
					0,
				);

				// TODO: 컨슈머 그룹이 없어서 에러가 나는경우 다시 컨슈머 그룹을 생성하는 로직 추가
				if (results) {
					for (const [, messages] of results) {
						for (const [messageId, [, message]] of messages) {
							const candleSaved = await this.candleSaveService.save(message);

							if (candleSaved) {
								await this.redisService.xadd("analysis", candleSaved);
							}

							// 메시지 처리 완료 표시
							await this.redisService.xack(this.STREAM, this.GROUP, messageId);
						}
					}
				}
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.logger.error(
						`${this.messageService.getPlainMessage(
							MessageKey.ERROR_STREAM_PROCESSING,
						)} - ${err}`,
						err.stack,
					);
				} else {
					this.logger.debug(err);
					this.logger.error(
						`${this.messageService.getPlainMessage(
							MessageKey.ERROR_STREAM_PROCESSING,
						)}`,
					);
				}

				// 에러 발생 시 3초 대기 후 재시도
				await new Promise((resolve) => setTimeout(resolve, 3000));
			}
		}
	}
}
