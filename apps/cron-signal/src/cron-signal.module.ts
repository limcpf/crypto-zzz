import { Module } from "@nestjs/common";
import { CronSignalController } from "./cron-signal.controller";

@Module({
	imports: [],
	controllers: [CronSignalController],
})
export class CronSignalModule {}
