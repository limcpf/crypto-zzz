import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions } from "@nestjs/microservices";
import { CronSignalModule } from "./cron-signal.module";
import { envCheck } from "./util/env-check.util";

async function bootstrap() {
	try {
		envCheck();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		CronSignalModule,
		{
			logger: false,
		},
	);

	await app.listen();
}

// noinspection JSIgnoredPromiseFromCall
bootstrap();
