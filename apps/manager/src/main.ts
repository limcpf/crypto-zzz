import { NestFactory } from "@nestjs/core";
import { ManagerModule } from "./manager.module";

async function bootstrap() {
	const app = await NestFactory.create(ManagerModule);
	await app.listen(process.env.port ?? 3000);

	console.log(`Server is running on port ${process.env.port ?? 3000}`);
}
bootstrap();
