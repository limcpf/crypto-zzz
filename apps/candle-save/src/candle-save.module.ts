import { CANDLE_SAVE_REPOSITORY } from "@apps/candle-save/src/constants/injection.tokens";
import { ExchangeModule } from "@libs/exchange/src/exchange.module";
import { ExchangeType } from "@libs/exchange/src/models/common.model";
import { LoggerModule } from "@libs/logger/logger.module";
import { PrismaModule } from "@libs/prisma/prisma.module";
import { registerRedisModule } from "@libs/redis";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CandleSaveController } from "./candle-save.controller";
import { CandleSaveService } from "./candle-save.service";
import { CandleSaveRepository } from "./repository/candle-save.repository";

@Module({
	imports: [
		registerRedisModule({
			host: "redis",
			port: 6379,
		}),
		ConfigModule.forRoot({
			envFilePath: [".env.development", ".env"],
			isGlobal: true,
		}),
		ExchangeModule.register(ExchangeType.UPBIT),
		LoggerModule.forRoot({
			discordInfoWebhookUrl: process.env.DISCORD_INFO_WEBHOOK_URL,
			discordErrorWebhookUrl: process.env.DISCORD_ERROR_WEBHOOK_URL,
			minLogLevelForDiscord: "warn",
			environment: process.env.NODE_ENV,
		}),
		PrismaModule,
	],
	controllers: [CandleSaveController],
	providers: [
		CandleSaveService,
		{
			provide: CANDLE_SAVE_REPOSITORY,
			useClass: CandleSaveRepository,
		},
	],
})
export class CandleSaveModule {
	async onModuleInit() {}
}
