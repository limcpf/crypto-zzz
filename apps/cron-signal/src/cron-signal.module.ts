import { Module } from "@nestjs/common";
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
	],
	controllers: [CronSignalController],
})
export class CronSignalModule {}
