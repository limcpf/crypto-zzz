import {
	CancelOrderResult,
	Order,
	OrderRequest,
} from "@libs/exchange/src/models/common.model";

export interface ITradeMarket {
	/**
	 * 주문 생성
	 * @param orderRequest 주문 요청 정보
	 * @returns 생성된 주문 정보
	 */
	createOrder(orderRequest: OrderRequest): Promise<Order>;

	/**
	 * 주문 취소
	 * @param symbol 코인 심볼
	 * @param orderId 주문 ID
	 * @returns 취소 결과
	 */
	cancelOrder(symbol: string, orderId: string): Promise<CancelOrderResult>;

	/**
	 * 주문 조회
	 * @param symbol 코인 심볼
	 * @param orderId 주문 ID
	 * @returns 주문 정보
	 */
	getOrder(symbol: string, orderId: string): Promise<Order>;

	/**
	 * 열린 주문 목록 조회
	 * @param symbol 코인 심볼 (선택적)
	 * @returns 열린 주문 배열
	 */
	getOpenOrders(symbol?: string): Promise<Order[]>;
}
