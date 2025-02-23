import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

@Injectable()
export class TradingService {
	constructor(private configService: ConfigService) {}

	getConfig(): string {
		return this.configService.get<string>("TRADING_API_KEY");
	}

	getHello(): string {
		return "Hello World!";
	}
}
