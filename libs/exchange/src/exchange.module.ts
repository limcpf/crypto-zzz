import { ExchangeFactory } from "@libs/exchange/src/factory/exchange.factory";
import { ExchangeType } from "@libs/exchange/src/models/common.model";
import { DynamicModule, Module } from "@nestjs/common";
import { ExchangeService } from "./exchange.service";

@Module({})
export class ExchangeModule {
	/**
	 * 기본 모듈 등록
	 * @returns 모듈 설정
	 */
	static register(
		exchangeType: ExchangeType = ExchangeType.UPBIT,
	): DynamicModule {
		return {
			module: ExchangeModule,
			providers: [
				{
					provide: "EXCHANGE_TYPE",
					useValue: exchangeType,
				},
				ExchangeFactory,
				ExchangeService,
			],
			exports: [ExchangeService, ExchangeFactory],
		};
	}
}
