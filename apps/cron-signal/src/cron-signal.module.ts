import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { CronSignalController } from "./cron-signal.controller";

@Module({
	imports: [ScheduleModule.forRoot()],
	controllers: [CronSignalController],
})
export class CronSignalModule {}
