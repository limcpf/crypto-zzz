import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CandleSaveService {
	private readonly exchange: IExchangeImpl;
	constructor(private readonly exchangeService: ExchangeService) {
		this.exchange = this.exchangeService.getExchange();
	}

	async save(message: string): Promise<string> {
		const candles = await this.exchange.getCandles(
			message,
			CandleInterval.ONE_MINUTE,
			{
				limit: 1,
			},
		);

		console.log(candles);
		return "Hello World!";
	}
}
