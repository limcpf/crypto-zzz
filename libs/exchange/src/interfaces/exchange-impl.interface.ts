import { IExchange } from "./exchange.interface";
import { IPrivateMarket } from "./private-market.interface";
import { IPublicMarket } from "./public-market.interface";
import { ITradeMarket } from "./trade-market.interface";

export interface IExchangeImpl
	extends IExchange,
		IPrivateMarket,
		IPublicMarket,
		ITradeMarket {}
