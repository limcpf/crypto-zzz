import {Candle} from "@prisma/client";


export interface IStrategyRepository<T, A extends unknown[] = unknown[]> {
    getData(...args: A): Promise<T>;
}

/**
 * 매수/매도를 위한 전략의 인터페이스
 */
export interface CandleAnalysisStrategy {
    /**
     * 캔들 데이터를 기반으로 점수 계산
     * @param candles
     * @return -1 ~ 1 사이의 점수
     */
     scoring(candles: Candle[]): Promise<number>;
}