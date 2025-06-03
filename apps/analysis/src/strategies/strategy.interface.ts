/**
 * 매수/매도를 위한 전략의 인터페이스
 */
export interface AnalysisStrategy {
	/**
	 * 전략값 계산
	 * @param coin 코인 이름
	 * @return 결과 데이터
	 */
	execute(coin: string): Promise<unknown>;
}
