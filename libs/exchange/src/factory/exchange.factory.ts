import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import {
	ExchangeCredentials,
	ExchangeType,
} from "@libs/exchange/src/models/common.model";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class ExchangeFactory implements OnModuleInit {
	private readonly registeredExchanges: Map<
		ExchangeType,
		new () => IExchangeImpl
	> = new Map();

	async onModuleInit() {
		// this.registeredExchanges.set(ExchangeType.UPBIT, new UpbitExchange());
	}
	/**
	 * 거래소 인스턴스 생성
	 * @param name 거래소 이름
	 * @param credentials 인증 정보 (선택적)
	 * @returns 거래소 인스턴스
	 */
	createExchange(
		name: ExchangeType,
		credentials?: ExchangeCredentials,
	): IExchangeImpl {
		const exchangeClass = this.registeredExchanges.get(name);

		if (!exchangeClass) {
			throw new Error(`Exchange "${name}" not found`);
		}

		const exchange = new exchangeClass();

		if (credentials) {
			exchange.setCredentials(credentials);
		}

		return exchange;
	}

	/**
	 * 등록된 모든 거래소 이름 반환
	 * @returns 거래소 이름 배열
	 */
	getRegisteredExchanges(): ExchangeType[] {
		return Array.from(this.registeredExchanges.keys());
	}
}
