import { Controller, Get } from "@nestjs/common";

@Controller()
export class CronSignalController {
	@Get()
	getHello(): string {
		return "Hello World!";
	}
}
