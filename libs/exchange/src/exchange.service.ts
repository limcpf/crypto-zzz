import { ExchangeFactory } from "@libs/exchange/src/factory/exchange.factory";
import { Inject, Injectable } from "@nestjs/common";
import { IExchangeImpl } from "./interfaces/exchange-impl.interface";
import { ExchangeCredentials, ExchangeType } from "./models/common.model";

/**
 * 거래소 서비스 - 애플리케이션에서 사용하는 기본 진입점
 */
@Injectable()
export class ExchangeService {
	private exchange: IExchangeImpl;

	constructor(
		private readonly exchangeFactory: ExchangeFactory,
		@Inject("EXCHANGE_TYPE") private readonly exchangeType: ExchangeType,
	) {}

	/**
	 * 거래소 인스턴스 획득
	 * @param name 거래소 이름
	 * @param credentials 인증 정보 (선택적)
	 * @returns 거래소 인스턴스
	 */
	getExchange(credentials?: ExchangeCredentials): IExchangeImpl {
		if (!this.exchange) {
			this.exchange = this.exchangeFactory.createExchange(
				this.exchangeType,
				credentials,
			);
			return this.exchange;
		}

		if (credentials) {
			this.exchange.setCredentials(credentials);
		}

		return this.exchange;
	}

	/**
	 * 등록된 모든 거래소 이름 반환
	 * @returns 거래소 이름 배열
	 */
	getAvailableExchanges(): string[] {
		return this.exchangeFactory.getRegisteredExchanges();
	}
}
