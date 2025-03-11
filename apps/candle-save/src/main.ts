import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { CandleSaveModule } from "./candle-save.module";

async function bootstrap() {
	const app = await NestFactory.create(CandleSaveModule, {
		logger: new ConsoleLogger({ json: true }),
	});
	await app.listen(process.env.port ?? 3000);

	console.log("DISCORD_INFO_WEBHOOK_URL", process.env.DISCORD_INFO_WEBHOOK_URL);
}
bootstrap();
