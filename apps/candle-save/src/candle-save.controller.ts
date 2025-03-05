import { RedisService } from "@libs/redis";
import { Controller, OnModuleInit } from "@nestjs/common";
import { CandleSaveService } from "./candle-save.service";

@Controller()
export class CandleSaveController implements OnModuleInit {
	private readonly STREAM = "candle";
	private readonly GROUP = "candle-save";
	private readonly CONSUMER = process.env.CONSUMER || "consumer-1";

	constructor(
		private readonly redisService: RedisService,
		private readonly candleSaveService: CandleSaveService,
	) {}

	async onModuleInit() {
		try {
			await this.redisService.xgroup(this.STREAM, this.GROUP);
		} catch (err) {
			console.log(err);
		}

		this.startConsumer();
	}

	private async startConsumer() {
		while (true) {
			try {
				const results = await this.redisService.xreadgroup(
					this.GROUP,
					this.CONSUMER,
					{ candle: ">" }, // ">"
					1,
					0,
				);

				// TODO: 컨슈머 그룹이 없어서 에러가 나는경우 다시 컨슈머 그룹을 생성하는 로직 추가

				if (results) {
					for (const [, messages] of results) {
						for (const [messageId, [, message]] of messages) {
							await this.candleSaveService.save(message);
							// 메시지 처리 완료 표시
							await this.redisService.xack(this.STREAM, this.GROUP, messageId);
						}
					}
				}
			} catch (err) {
				console.error("Error processing stream:", err);
				// 에러 발생 시 잠시 대기 후 재시도
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}
	}
}
