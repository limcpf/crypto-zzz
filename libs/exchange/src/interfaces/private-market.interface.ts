import {
	Balance,
	Trade,
	TradeHistoryParams,
} from "@libs/exchange/src/models/common.model";

export interface IPrivateMarket {
	/**
	 * 계정 잔액 조회
	 * @returns 자산별 잔액 맵
	 */
	getBalances(): Promise<Map<string, Balance>>;

	/**
	 * 특정 코인 잔액 조회
	 * @param asset 자산 심볼
	 * @returns 잔액 정보
	 */
	getBalance(asset: string): Promise<Balance>;

	/**
	 * 거래 내역 조회
	 * @param params 조회 파라미터
	 * @returns 거래 내역 배열
	 */
	getTradeHistory(params: TradeHistoryParams): Promise<Trade[]>;
}
