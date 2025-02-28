import { NestFactory } from "@nestjs/core";
import {
	MicroserviceOptions,
	RedisOptions,
	Transport,
} from "@nestjs/microservices";
import { CronSignalModule } from "./cron-signal.module";
import { envCheck } from "./util/env-check.util";

async function bootstrap() {
	try {
		envCheck();
	} catch (error) {
		process.exit(1);
	}

	const isDev = process.env.NODE_ENV === "development";

	const redisOptions: RedisOptions = {
		transport: Transport.REDIS,
		options: {
			host: isDev ? "redis" : process.env.REDIS_HOST,
			port: Number.parseInt(process.env.REDIS_PORT ?? "6379"),
		},
	};

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		CronSignalModule,
		redisOptions,
	);

	await app.init();
}
bootstrap();
