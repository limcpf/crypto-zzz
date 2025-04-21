import { CandleSaveResponse } from "@apps/candle-save/src/constants/candle-save.types";
import { ICandleSaveRepository } from "@apps/candle-save/src/repository/candle-save.repository";
import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { CoinLogger } from "@libs/logger/coin-logger";
import { DateUtil } from "@libs/util/date-util";
import { Inject, Injectable } from "@nestjs/common";
import { CANDLE_SAVE_REPOSITORY } from "./constants/injection.tokens";
import { Candle } from "@prisma/client";

@Injectable()
export class CandleSaveService {
	private readonly exchange: IExchangeImpl; // 거래소 구현체 Exchange Implementation

	constructor(
		@Inject(CANDLE_SAVE_REPOSITORY)
		private readonly candleRepository: ICandleSaveRepository, // 캔들 데이터 저장 리포지토리 Candle Save Repository
		private readonly exchangeService: ExchangeService, // 거래소 서비스 Exchange Service
		private readonly logger: CoinLogger, // 코인 로거 Coin Logger
	) {
		this.exchange = this.exchangeService.getExchange();
		this.logger.setContext("CandleSaveService");
	}

	/**
	 * Save candles to database(upsert)
	 * 캔들 데이터를 데이터베이스에 저장(upsert)
	 * @param coin - 코인 심볼 Coin Symbol
	 * @returns 저장된 캔들 데이터 Saved Candle Data
	 */
	async upsert(coin: string): Promise<CandleSaveResponse | undefined> {
		/** Call exchange API to get candles */
		/** 캔들 데이터 조회 거래소 API 호출 */
		const candles = await this.exchange.getCandles(
			coin,
			CandleInterval.ONE_MINUTE,
			{
				limit: 1,
			},
		);

		if (candles.length === 0) return;

		/** Save candles to database(upsert) */
		/** 캔들 데이터 데이터베이스에 저장(upsert) */
		const candlesSaved = await this.candleRepository.upsert(candles);

		return {
			coin: candlesSaved[0].symbol,
			timestamp: DateUtil.formatDate(candlesSaved[0].timestamp),
		};
	}

	async replacePriorDataByCoin(coin: string, days = 3): Promise<number> {
		// 1. 기존 데이터 삭제
		await this.deleteCandlesByCoin(coin);

		// 2. 로드할 데이터 날짜 계산
		const now = new Date();
		const startDate = new Date();
		startDate.setDate(now.getDate() - days);

		const candleCount = this.calcCandlesBetweenDates(startDate, now);

		// 3. 데이터 조회
		// Upbit의 조회 상한선이 200개까지 이므로 200씩 끊음
		const candles = await this.fetchCandlesByCoin(coin, candleCount, now);
		this.logger.debug(`candles.length : ${candles.length}`);

		// 4. 저장
		const insertCount = await this.candleRepository.insert(candles);
		this.logger.debug(
			`${coin} 캔들 저장 완료. 총 ${insertCount}개, 중복된 캔들: ${candles.length - insertCount}`,
		);

		return insertCount;
	}

	async deleteCandlesByCoin(coin: string): Promise<number> {
		try {
			return await this.candleRepository.deleteAllByCoin(coin);
		} catch (e: unknown) {
			if (e instanceof Error && e.message.includes("production")) {
				this.logger.warn("production에서는 데이터를 삭제할 수 없습니다!");
				return 0;
			}

			this.logger.error(e);
			throw e;
		}
	}

	/**
	 * updateCandleData - candle 데이터를 업데이트한다.
	 *
	 * @param coin - 업데이트 할 코인 식별자
	 */
	async fetchCandlesByCoin(
		coin: string,
		count: number,
		date = new Date(),
		minutes = 5,
	): Promise<Candle[]> {
		let result: Candle[] = [];
		const startDate = new Date(date.getTime());
		let cnt = count;

		while (cnt > 0) {
			this.logger.debug(`candle count : ${cnt}`);

			startDate.setMinutes(startDate.getMinutes() - cnt * minutes);

			const limit = Math.min(cnt, 200);
			this.logger.debug(`limit : ${limit}, date : ${startDate.toISOString()}`);

			// 3. 외부 API 호출하여 3일간 5분 캔들 데이터 조회
			const candles = await this.exchange.getCandles(
				coin,
				CandleInterval.FIVE_MINUTES,
				{ startTime: startDate.toISOString(), limit },
			);

			this.logger.debug(`candles: ${candles.length}`);

			if (candles.length > 0) {
				result = [...result, ...candles];
			}

			this.logger.debug(`result: ${result.length}`);

			cnt -= limit;
		}

		return result;
	}

	calcCandlesBetweenDates(startDate: Date, endDate: Date): number {
		const candleCount = Math.floor(
			(endDate.getTime() - startDate.getTime()) / (5 * 60 * 1000),
		);

		return Math.abs(candleCount);
	}
}
