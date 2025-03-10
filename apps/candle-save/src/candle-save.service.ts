import { CandleSaveResponse } from "@apps/candle-save/src/constants/candle-save.types";
import { ICandleRepository } from "@apps/candle-save/src/repository/candle-save.repository";
import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { Inject, Injectable } from "@nestjs/common";
import { CANDLE_REPOSITORY } from "./constants/injection.tokens";

@Injectable()
export class CandleSaveService {
	private readonly exchange: IExchangeImpl;

	constructor(
		@Inject(CANDLE_REPOSITORY)
		private readonly candleRepository: ICandleRepository,
		private readonly exchangeService: ExchangeService,
	) {
		this.exchange = this.exchangeService.getExchange();
	}

	async save(coin: string): Promise<CandleSaveResponse> {
		const candles = await this.exchange.getCandles(
			coin,
			CandleInterval.ONE_MINUTE,
			{
				limit: 1,
			},
		);

		const candlesSaved = await this.candleRepository.save(candles);

		return {
			coin: candlesSaved[0].symbol,
			timestamp: candlesSaved[0].timestamp,
		};
	}
}
