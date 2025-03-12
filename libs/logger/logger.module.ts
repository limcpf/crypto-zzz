import { DynamicModule, Global, Module } from "@nestjs/common";
import { CoinLogger, CoinLoggerOptions } from "./coin-logger";

@Global()
@Module({})
export class LoggerModule {
	static forRoot(options: CoinLoggerOptions = {}): DynamicModule {
		return {
			module: LoggerModule,
			providers: [
				{
					provide: CoinLogger,
					useFactory: () => {
						return new CoinLogger("DefaultContext", options);
					},
				},
			],
			exports: [CoinLogger],
		};
	}
}
