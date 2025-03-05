import { PrismaModule } from "@libs/prisma/prisma.module";
import { registerRedisModule } from "@libs/redis";
import { Module } from "@nestjs/common";
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
	],
	controllers: [CandleSaveController],
	providers: [CandleSaveService],
})
export class CandleSaveModule {}
