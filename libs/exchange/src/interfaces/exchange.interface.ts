import {
	ConnectionStatus,
	ExchangeCredentials,
} from "@libs/exchange/src/models/common.model";

/**
 * 모든 거래소 구현체가 따라야 하는 기본 인터페이스
 */
export interface IExchange {
	/**
	 * 거래소 이름
	 */
	readonly name: string;

	/**
	 * 거래소 인증 정보
	 */
	credentials: ExchangeCredentials;

	/**
	 * 거래소 연결 상태 확인
	 * @returns 연결 상태 정보
	 */
	checkConnection(): Promise<ConnectionStatus>;

	/**
	 * 거래소 인증 설정
	 * @param credentials 인증 정보
	 */
	setCredentials(credentials: ExchangeCredentials): void;

	/**
	 * 인증 상태 확인
	 * @returns 인증 여부
	 */
	isAuthenticated(): boolean;
}
