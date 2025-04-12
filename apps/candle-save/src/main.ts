import { NestFactory } from "@nestjs/core";
import { CandleSaveModule } from "./candle-save.module";

async function bootstrap() {
	const app = await NestFactory.create(CandleSaveModule);
	await app.listen(process.env.port ?? 3000);
}

// noinspection JSIgnoredPromiseFromCall
bootstrap();
