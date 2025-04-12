import {Controller} from "@nestjs/common";
import {AnalysisService} from "./analysis.service";
import {RedisService} from "@libs/redis";
import {CoinLogger} from "@libs/logger/coin-logger";
import {MessageService} from "@libs/messages/message.service";
import {MessageKey} from "@libs/messages/message-keys";
import * as process from "node:process";

@Controller()
export class AnalysisController {
	private readonly STREAM = "analysis";
	private readonly GROUP = "analysis";
	private readonly CONSUMER = process.env.CONSUMER || "consumer-2";

	constructor(
		private readonly analysisService: AnalysisService,
		private readonly redisService: RedisService,
		private readonly logger: CoinLogger,
		private readonly messageService: MessageService,
	) {}

	// noinspection JSUnusedGlobalSymbols
	async onModuleInit() {
		try {
			await this.redisService.xgroup(this.STREAM, this.GROUP);
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(
					`${this.messageService.getPlainMessage(
						MessageKey.ERROR_REDIS_XGROUP,
					)} - ${err}`,
					err.stack,
				);
			} else {
				this.logger.debug(err);
				this.logger.error(
					`${this.messageService.getPlainMessage(
						MessageKey.ERROR_REDIS_XGROUP,
					)}`,
				);

				process.exit(1);
			}
		}

		await this.startConsumer();
	}

	// TODO : 해당 메서드 수정 필요
	private async startConsumer() {
		let id = "";

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

				if (results) {
					for (const [, messages] of results) {
						for (const [messageId, [, message]] of messages) {
							id = messageId;
							const score = await this.analysisService.scoring(message);

							if (score) await this.analysisService.decision(score);
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
			} finally {
				await this.redisService.xack(this.STREAM, this.GROUP, id);
			}
		}
	}
}
