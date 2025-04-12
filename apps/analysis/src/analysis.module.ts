import { Module } from "@nestjs/common";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { registerRedisModule } from "@libs/redis";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "@libs/logger/logger.module";
import { PrismaModule } from "@libs/prisma/prisma.module";
import { MessageModule } from "@libs/messages/message.module";
import { HttpClientModule } from "@libs/common/http/http-client.module";
import StrategyModule from "@apps/analysis/src/strategies/strategy.module";

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
		LoggerModule.forRoot({
			discordInfoWebhookUrl: process.env.DISCORD_INFO_WEBHOOK_URL,
			discordErrorWebhookUrl: process.env.DISCORD_ERROR_WEBHOOK_URL,
			minLogLevelForDiscord: "warn",
			environment: process.env.NODE_ENV,
		}),
		PrismaModule,
		MessageModule,
		HttpClientModule,
		StrategyModule,
	],
	controllers: [AnalysisController],
	providers: [AnalysisService],
})
export class AnalysisModule {}
