import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { registerGlobalRedisModule } from "libs/redis";
import { CronSignalController } from "./cron-signal.controller";

@Module({
	imports: [
		ScheduleModule.forRoot(),
		registerGlobalRedisModule({
			host: "redis",
			port: 6379,
		}),
		ConfigModule.forRoot({
			envFilePath: [".env.development", ".env"],
			isGlobal: true,
		}),
	],
	controllers: [CronSignalController],
})
export class CronSignalModule {}
