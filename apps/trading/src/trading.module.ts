import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TradingController } from "./trading.controller";
import { TradingService } from "./trading.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ["apps/trading/.env.development", "apps/trading/.env"],
			isGlobal: true,
		}),
	],
	controllers: [TradingController],
	providers: [TradingService],
})
export class TradingModule {}
