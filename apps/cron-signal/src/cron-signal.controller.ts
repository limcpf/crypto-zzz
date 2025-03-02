import { RedisService } from "@libs/redis";
import { Controller } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Controller()
export class CronSignalController {
	private readonly COINS = process.env.COINS?.split(",") || [];
	private readonly UNIT = process.env.UNIT;

	constructor(private readonly redisService: RedisService) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async saveCandleData(): Promise<void> {
		for (const coin of this.COINS) {
			const ticker = `${this.UNIT}-${coin}`;

			await this.redisService.xadd("candle", {
				ticker,
				timestamp: new Date().toISOString(),
			});
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	cleanDataBase(): void {
		// REDIS XADD, CLEAN_CANDLE_DATA
	}

	@Cron(process.env.TRADING_NOTIFICATION_CRON_EXPRESSION || "0 0 9-18 * * *")
	sendTradingNotification(): void {
		// REDIS SELECT TRADING

		for (const coin of this.COINS) {
			/**
			 * IF HAS TRADING DATA
			 * 		REDIS XADD, SEND_TRADING_NOTIFICATION
			 * ELSE
			 * 		REDIS XADD, SEND_TRADING_NOTIFICATION_NONE -- PRINT SCORE
			 */
		}
	}
}
