import { HttpClientModule } from "@libs/common/http/http-client.module";
import { HttpClientService } from "@libs/common/http/http-client.service";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { CoinLogger, CoinLoggerOptions } from "./coin-logger";

@Global()
@Module({})
export class LoggerModule {
	static forRoot(options: CoinLoggerOptions = {}): DynamicModule {
		return {
			module: LoggerModule,
			imports: [HttpClientModule],
			providers: [
				{
					provide: CoinLogger,
					useFactory: (httpClient: HttpClientService) => {
						return new CoinLogger(httpClient, "DefaultContext", options);
					},
					inject: [HttpClientService],
				},
			],
			exports: [CoinLogger],
		};
	}
}
