import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { Injectable } from "@nestjs/common";
import {
	Balance,
	CancelOrderResult,
	Candle,
	CandleParams,
	CoinPrice,
	ConnectionStatus,
	DepositWithdrawHistoryParams,
	DepositWithdrawRecord,
	ExchangeCredentials,
	Order,
	OrderBook,
	OrderRequest,
	Trade,
	TradeHistoryParams,
} from "../models/common.model";

@Injectable()
export class UpbitExchange implements IExchangeImpl {
	readonly name = "Upbit";
	private credentials: ExchangeCredentials = {
		apiKey: "",
		secretKey: "",
	};

	constructor(private readonly exchangeService: ExchangeService) {}

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
		interval: string,
		params: CandleParams,
	): Promise<Candle[]> {
		throw new Error("Method not implemented.");
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

	static registerExchange(factory: any): void {
		factory.registerExchange("upbit", UpbitExchange);
	}
}
