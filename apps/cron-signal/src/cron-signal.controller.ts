import { Controller, Get } from "@nestjs/common";
import { CronSignalService } from "./cron-signal.service";

@Controller()
export class CronSignalController {
	@Get()
	getHello(): string {
		return this.cronSignalService.getHello();
	}
}
