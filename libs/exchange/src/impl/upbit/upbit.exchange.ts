import { ExchangeFactory } from "@libs/exchange/src/factory/exchange.factory";
import { UpbitCandle } from "@libs/exchange/src/impl/upbit/upbit.models";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CoinLogger } from "@libs/logger/coin-logger";
import { MessageKey } from "@libs/messages/message-keys";
import { MessageService } from "@libs/messages/message.service";
import { Injectable } from "@nestjs/common";
import { Candle } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import ky, { KyResponse } from "ky";
import {
	Balance,
	CancelOrderResult,
	CandleInterval,
	CandleParams,
	Candle as CandleType,
	CoinPrice,
	ConnectionStatus,
	DepositWithdrawHistoryParams,
	DepositWithdrawRecord,
	ExchangeCredentials,
	ExchangeType,
	Order,
	OrderBook,
	OrderRequest,
	Trade,
	TradeHistoryParams,
} from "../../models/common.model";
@Injectable()
export class UpbitExchange implements IExchangeImpl {
	constructor(private readonly messageService: MessageService) {}

	readonly name = "Upbit";
	private readonly baseUrl = "https://api.upbit.com";

	credentials: ExchangeCredentials = {
		apiKey: "",
		secretKey: "",
	};

	async checkConnection(): Promise<ConnectionStatus> {
		throw new Error("Method not implemented.");
	}

	setCredentials(credentials: ExchangeCredentials): void {
		this.credentials = credentials;
	}

	isAuthenticated(): boolean {
		return !!this.credentials;
	}

	async getPrice(symbol: string): Promise<CoinPrice> {
		throw new Error("Method not implemented.");
	}

	async getPrices(symbols: string[]): Promise<Map<string, CoinPrice>> {
		throw new Error("Method not implemented.");
	}

	async getOrderBook(symbol: string, depth?: number): Promise<OrderBook> {
		throw new Error("Method not implemented.");
	}

	async getRecentTrades(symbol: string, limit?: number): Promise<Trade[]> {
		throw new Error("Method not implemented.");
	}

	async getCandles(
		symbol: string,
		interval: CandleInterval,
		params: CandleParams,
	): Promise<Candle[]> {
		const url = this.getCandlesUrl(symbol, interval, params);

		try {
			const response = await ky.get(url, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			this.upbitErrorHandler(response, "[Upbit] getCandles - ");

			const candles = await response.json<UpbitCandle[]>();

			return candles.map((candle) => ({
				symbol: candle.market,
				timestamp: new Date(candle.timestamp),
				openPrice: new Decimal(candle.opening_price),
				highPrice: new Decimal(candle.high_price),
				lowPrice: new Decimal(candle.low_price),
				closePrice: new Decimal(candle.trade_price),
				volume: new Decimal(candle.candle_acc_trade_volume),
			}));
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(error.message);
			}

			throw new Error(
				this.messageService.getPlainMessage(MessageKey.ERROR_UPBIT_GET_CANDLES),
			);
		}
	}

	private getCandlesUrl(
		symbol: string,
		interval: CandleInterval,
		params: CandleParams,
	): string {
		const start_time =
			params.startTime ?? new Date(Date.now() - 60 * 1000).toISOString();

		let url = `${this.baseUrl}/v1/candles/`;
		url += this.convertCandleInterval(interval);
		url += `?market=${symbol}&to=${start_time}&count=${params.limit ?? 1}`;

		return url;
	}

	private convertCandleInterval(interval: CandleInterval): string {
		if (
			[
				CandleInterval.ONE_MINUTE,
				CandleInterval.FIVE_MINUTES,
				CandleInterval.FIFTEEN_MINUTES,
				CandleInterval.THIRTY_MINUTES,
			].includes(interval)
		) {
			return `minutes/${interval.split("m")[0]}`;
		}

		if (
			[CandleInterval.ONE_HOUR, CandleInterval.FOUR_HOURS].includes(interval)
		) {
			// TODO: 상수처리
			throw new Error("Upbit는 시간 단위의 캔들 데이터를 지원하지 않습니다.");
		}

		if (interval === CandleInterval.ONE_DAY) {
			return "days";
		}

		if (interval === CandleInterval.ONE_WEEK) {
			return "weeks";
		}

		if (interval === CandleInterval.ONE_MONTH) {
			return "months";
		}

		throw new Error("Upbit는 지원하지 않는 캔들 데이터입니다.");
	}

	async createOrder(orderRequest: OrderRequest): Promise<Order> {
		throw new Error("Method not implemented.");
	}

	async cancelOrder(
		symbol: string,
		orderId: string,
	): Promise<CancelOrderResult> {
		throw new Error("Method not implemented.");
	}

	async getOrder(symbol: string, orderId: string): Promise<Order> {
		throw new Error("Method not implemented.");
	}

	async getOpenOrders(symbol?: string): Promise<Order[]> {
		throw new Error("Method not implemented.");
	}

	async getBalances(): Promise<Map<string, Balance>> {
		throw new Error("Method not implemented.");
	}

	async getBalance(asset: string): Promise<Balance> {
		throw new Error("Method not implemented.");
	}

	async getTradeHistory(params: TradeHistoryParams): Promise<Trade[]> {
		throw new Error("Method not implemented.");
	}

	async getDepositWithdrawHistory(
		params: DepositWithdrawHistoryParams,
	): Promise<DepositWithdrawRecord[]> {
		throw new Error("Method not implemented.");
	}

	static registerExchange(factory: ExchangeFactory): void {
		factory.createExchange(ExchangeType.UPBIT);
	}

	private upbitErrorHandler(
		response: KyResponse<unknown>,
		prefix: string,
	): void {
		let suffix = "";
		if (response.statusText) {
			suffix = ` ${response.statusText}`;
		}

		switch (response.status) {
			case 200:
			case 201:
				return;
			case 400:
				throw new Error(`${prefix} 잘못된 요청입니다. - ${suffix}`);
			case 401:
				throw new Error(`${prefix} 인증 실패입니다. - ${suffix}`);
			case 403:
				throw new Error(`${prefix} 권한이 없습니다. - ${suffix}`);
			default:
				throw new Error(`${prefix} 오류가 발생했습니다. - ${suffix}`);
		}
	}
}
