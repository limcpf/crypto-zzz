import { CandleSaveResponse } from "@apps/candle-save/src/constants/candle-save.types";
import { ICandleSaveRepository } from "@apps/candle-save/src/repository/candle-save.repository";
import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { DateUtil } from "@libs/util/date-util";
import { Inject, Injectable } from "@nestjs/common";
import { CANDLE_SAVE_REPOSITORY } from "./constants/injection.tokens";

@Injectable()
export class CandleSaveService {
	private readonly exchange: IExchangeImpl; // 거래소 구현체 Exchange Implementation

	constructor(
		@Inject(CANDLE_SAVE_REPOSITORY)
		private readonly candleRepository: ICandleSaveRepository, // 캔들 데이터 저장 리포지토리 Candle Save Repository
		private readonly exchangeService: ExchangeService, // 거래소 서비스 Exchange Service
	) {
		this.exchange = this.exchangeService.getExchange();
	}

	/**
	 * Save candles to database(upsert)
	 * 캔들 데이터를 데이터베이스에 저장(upsert)
	 * @param coin - 코인 심볼 Coin Symbol
	 * @returns 저장된 캔들 데이터 Saved Candle Data
	 */
	async save(coin: string): Promise<CandleSaveResponse> {
		/** Call exchange API to get candles */
		/** 캔들 데이터 조회 거래소 API 호출 */
		const candles = await this.exchange.getCandles(
			coin,
			CandleInterval.ONE_MINUTE,
			{
				limit: 1,
			},
		);

		/** Save candles to database(upsert) */
		/** 캔들 데이터 데이터베이스에 저장(upsert) */
		const candlesSaved = await this.candleRepository.save(candles);

		return {
			coin: candlesSaved[0].symbol,
			timestamp: DateUtil.formatDate(candlesSaved[0].timestamp),
		};
	}
}
