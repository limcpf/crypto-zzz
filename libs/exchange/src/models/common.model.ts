// libs/exchange/src/models/common.model.ts

export enum OrderSide {
	BUY = "BUY",
	SELL = "SELL",
}

export enum OrderType {
	MARKET = "MARKET",
	LIMIT = "LIMIT",
	STOP_LOSS = "STOP_LOSS",
	STOP_LOSS_LIMIT = "STOP_LOSS_LIMIT",
	TAKE_PROFIT = "TAKE_PROFIT",
	TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT",
}

export enum OrderStatus {
	NEW = "NEW",
	PARTIALLY_FILLED = "PARTIALLY_FILLED",
	FILLED = "FILLED",
	CANCELED = "CANCELED",
	REJECTED = "REJECTED",
	EXPIRED = "EXPIRED",
}

export enum CandleInterval {
	ONE_MINUTE = "1m",
	FIVE_MINUTES = "5m",
	FIFTEEN_MINUTES = "15m",
	THIRTY_MINUTES = "30m",
	ONE_HOUR = "1h",
	FOUR_HOURS = "4h",
	ONE_DAY = "1d",
	ONE_WEEK = "1w",
	ONE_MONTH = "1M",
}

export interface ConnectionStatus {
	connected: boolean;
	timestamp: number;
	message?: string;
}

export interface ExchangeCredentials {
	apiKey: string;
	secretKey: string;
	passphrase?: string;
	privateKey?: string;
	additionalParams?: Record<string, unknown>;
}

export interface CoinPrice {
	symbol: string;
	price: string;
	timestamp: number;
}

export interface OrderBookEntry {
	price: string;
	quantity: string;
}

export interface OrderBook {
	symbol: string;
	bids: OrderBookEntry[];
	asks: OrderBookEntry[];
	timestamp: number;
}

export interface Trade {
	id: string;
	symbol: string;
	price: string;
	quantity: string;
	quoteQuantity: string;
	time: number;
	isBuyer: boolean;
	isMaker: boolean;
	fee?: {
		asset: string;
		cost: string;
	};
}

export interface Candle {
	openTime: number;
	open: string;
	high: string;
	low: string;
	close: string;
	volume: string;
	closeTime: number;
	quoteAssetVolume: string;
	trades: number;
	takerBuyBaseAssetVolume: string;
	takerBuyQuoteAssetVolume: string;
}

export interface CandleParams {
	startTime?: string;
	limit?: number;
}

export interface OrderRequest {
	symbol: string;
	side: OrderSide;
	type: OrderType;
	quantity?: string;
	quoteOrderQty?: string;
	price?: string;
	stopPrice?: string;
	timeInForce?: "GTC" | "IOC" | "FOK";
	newClientOrderId?: string;
}

export interface Order {
	symbol: string;
	orderId: string;
	clientOrderId: string;
	price: string;
	origQty: string;
	executedQty: string;
	status: OrderStatus;
	timeInForce: string;
	type: OrderType;
	side: OrderSide;
	stopPrice?: string;
	time: number;
	updateTime: number;
	fills?: {
		price: string;
		qty: string;
		commission: string;
		commissionAsset: string;
	}[];
}

export interface CancelOrderResult {
	symbol: string;
	orderId: string;
	status: boolean;
	message?: string;
}

export interface Balance {
	asset: string;
	free: string;
	locked: string;
	total?: string;
}

export interface TradeHistoryParams {
	symbol: string;
	limit?: number;
	fromId?: string;
	startTime?: number;
	endTime?: number;
}

export type DepositWithdrawType = "DEPOSIT" | "WITHDRAW";

export interface DepositWithdrawRecord {
	id: string;
	type: DepositWithdrawType;
	asset: string;
	amount: string;
	status: string;
	address?: string;
	txId?: string;
	time: number;
}

export interface DepositWithdrawHistoryParams {
	asset?: string;
	type?: DepositWithdrawType;
	status?: string;
	startTime?: number;
	endTime?: number;
	limit?: number;
}

export enum ExchangeType {
	UPBIT = "upbit",
}
