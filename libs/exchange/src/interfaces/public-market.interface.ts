import {
	CandleInterval,
	CandleParams,
	CoinPrice,
	OrderBook,
	Trade,
} from "@libs/exchange/src/models/common.model";
import { Candle } from "@prisma/client";

export interface IPublicMarket {
	/**
	 * 코인 가격 정보 조회
	 * @param symbol 코인 심볼
	 * @returns 코인 가격 정보
	 */
	getPrice(symbol: string): Promise<CoinPrice>;

	/**
	 * 여러 코인 가격 정보 일괄 조회
	 * @param symbols 코인 심볼 배열
	 * @returns 코인별 가격 정보 맵
	 */
	getPrices(symbols: string[]): Promise<Map<string, CoinPrice>>;

	/**
	 * 오더북 정보 조회
	 * @param symbol 코인 심볼
	 * @param depth 오더북 깊이 (선택적)
	 * @returns 오더북 정보
	 */
	getOrderBook(symbol: string, depth?: number): Promise<OrderBook>;

	/**
	 * 최근 거래 내역 조회
	 * @param symbol 코인 심볼
	 * @param limit 조회할 거래 수 (선택적)
	 * @returns 거래 내역 배열
	 */
	getRecentTrades(symbol: string, limit?: number): Promise<Trade[]>;

	/**
	 * 캔들스틱(차트) 데이터 조회
	 * @param symbol 코인 심볼
	 * @param interval 시간 간격
	 * @param params 추가 파라미터
	 * @returns 캔들스틱 데이터 배열
	 */
	getCandles(
		symbol: string,
		interval: CandleInterval,
		params: CandleParams,
	): Promise<Candle[]>;
}
