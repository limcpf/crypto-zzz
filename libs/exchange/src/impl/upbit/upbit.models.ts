[
	{
		market: "KRW-BTC",
		candle_date_time_utc: "2018-04-16T00:00:00",
		candle_date_time_kst: "2018-04-16T09:00:00",
		opening_price: 8665000,
		high_price: 8840000,
		low_price: 8360000,
		trade_price: 8611000,
		timestamp: 1524046708995,
		candle_acc_trade_price: 466989414916.1301,
		candle_acc_trade_volume: 54410.56660813,
		first_day_of_period: "2018-04-16",
	},
];

export interface UpbitCandle {
	/** 종목 코드 */
	market: string;
	/** 캔들 기준 시각 (UTC 기준, 포맷: yyyy-MM-dd'T'HH:mm:ss) */
	candle_date_time_utc: string;
	/** 캔들 기준 시각 (KST 기준, 포맷: yyyy-MM-dd'T'HH:mm:ss) */
	candle_date_time_kst: string;
	/** 시가 */
	opening_price: number;
	/** 고가 */
	high_price: number;
	/** 저가 */
	low_price: number;
	/** 종가 */
	trade_price: number;
	/** 마지막 틱이 저장된 시각 */
	timestamp: number;
	/** 누적 거래 금액 */
	candle_acc_trade_price: number;
	/** 누적 거래량 */
	candle_acc_trade_volume: number;
	/** 캔들 기간의 가장 첫 날 (월 캔들인 경우 존재) */
	first_day_of_period?: string;

	/** 분 단위(유닛) - 분 캔들인 경우에만 존재 */
	unit?: number;

	/** 전일 종가 (UTC 0시 기준) - 일 캔들인 경우에만 존재 */
	prev_closing_price?: number;
	/** 전일 종가 대비 변화 금액 - 일 캔들인 경우에만 존재 */
	change_price?: number;
	/** 전일 종가 대비 변화량 - 일 캔들인 경우에만 존재 */
	change_rate?: number;
	/** 종가 환산 화폐 단위로 환산된 가격 (요청에 convertingPriceUnit 파라미터 없을 시 해당 필드 포함되지 않음) - 일 캔들인 경우에만 존재 */
	converted_trade_price?: number;
}
