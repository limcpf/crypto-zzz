import { DynamicModule } from "@nestjs/common";
import { RedisService } from "./redis.service";

export interface RedisModuleOptions {
	host: string;
	port: number;
	password?: string;
	db?: number;
	keyPrefix?: string;
	connectionName?: string;
	retryStrategy?: (times: number) => number | null;
}

/**
 * Redis 모듈을 등록합니다.
 * @param options Redis 연결 옵션
 * @returns 동적 모듈
 */
export function registerRedisModule(
	options: RedisModuleOptions,
): DynamicModule {
	return {
		module: class RedisModule {},
		providers: [
			{
				provide: "REDIS_OPTIONS",
				useValue: options,
			},
			RedisService,
		],
		exports: [RedisService],
	};
}

/**
 * Redis 모듈을 전역으로 등록합니다.
 * @param options Redis 연결 옵션
 * @returns 전역 동적 모듈
 */
export function registerGlobalRedisModule(
	options: RedisModuleOptions,
): DynamicModule {
	const module = registerRedisModule(options);
	return {
		...module,
		global: true,
	};
}
