import { UpbitExchange } from "@libs/exchange/src/impl/upbit/upbit.exchange";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import {
	ExchangeCredentials,
	ExchangeType,
} from "@libs/exchange/src/models/common.model";
import { MessageService } from "@libs/messages/message.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExchangeFactory {
	constructor(private readonly messageService: MessageService) {}
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
		let exchange: IExchangeImpl;

		switch (name) {
			case ExchangeType.UPBIT:
				exchange = new UpbitExchange(this.messageService);
				break;
			default:
				throw new Error(`Exchange "${name}" not found`);
		}

		if (credentials) {
			exchange.setCredentials(credentials);
		}

		return exchange;
	}
}
