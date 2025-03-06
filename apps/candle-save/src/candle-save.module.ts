import { ExchangeModule } from "@libs/exchange/src/exchange.module";
import { ExchangeType } from "@libs/exchange/src/models/common.model";
import { registerRedisModule } from "@libs/redis";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CandleSaveController } from "./candle-save.controller";
import { CandleSaveService } from "./candle-save.service";

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
	],
	controllers: [CandleSaveController],
	providers: [CandleSaveService],
})
export class CandleSaveModule implements OnModuleInit {
	async onModuleInit() {
		console.log("CandleSaveModule initialized");
	}
}
