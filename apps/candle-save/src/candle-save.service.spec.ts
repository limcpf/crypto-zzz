import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { CoinLogger } from "@libs/logger/coin-logger";
import { Test, TestingModule } from "@nestjs/testing";
import { Candle } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { CandleSaveService } from "./candle-save.service";
import { CANDLE_SAVE_REPOSITORY } from "./constants/injection.tokens";
import { ICandleSaveRepository } from "./repository/candle-save.repository";

describe("CandleSaveService", () => {
	let service: CandleSaveService;
	let candleRepository: ICandleSaveRepository;
	let exchangeService: ExchangeService;
	let exchange: IExchangeImpl;
	let logger: CoinLogger;

	// 테스트 전 모의 객체 설정
	beforeEach(async () => {
		// 모의 객체 생성
		const mockCandleRepository = {
			save: jest.fn(),
		};

		const mockExchange = {
			getCandles: jest.fn(),
		};

		const mockExchangeService = {
			getExchange: jest.fn().mockReturnValue(mockExchange),
		};

		const mockLogger = {
			setContext: jest.fn(),
			log: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
			debug: jest.fn(),
		};

		// 테스트 모듈 생성
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CandleSaveService,
				{
					provide: CANDLE_SAVE_REPOSITORY,
					useValue: mockCandleRepository,
				},
				{
					provide: ExchangeService,
					useValue: mockExchangeService,
				},
				{
					provide: CoinLogger,
					useValue: mockLogger,
				},
			],
		}).compile();

		// 서비스 및 모의 객체 참조 가져오기
		service = module.get<CandleSaveService>(CandleSaveService);
		candleRepository = module.get<ICandleSaveRepository>(
			CANDLE_SAVE_REPOSITORY,
		);
		exchangeService = module.get<ExchangeService>(ExchangeService);
		exchange = exchangeService.getExchange();
		logger = module.get<CoinLogger>(CoinLogger);
	});

	// 서비스가 정의되었는지 확인하는 기본 테스트
	it("서비스가 정의되어야 함", () => {
		expect(service).toBeDefined();
	});

	// save 메서드 테스트
	describe("save", () => {
		it("코인 캔들 데이터를 성공적으로 저장해야 함", async () => {
			const mockCoin = "KRW-BTC";
			const mockTimestamp = new Date();
			const mockCandles: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: mockTimestamp,
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			];

			(exchange.getCandles as jest.Mock).mockResolvedValue(mockCandles);
			(candleRepository.save as jest.Mock).mockResolvedValue(mockCandles);

			// Act
			const result = await service.save(mockCoin);

			// Assert
			expect(exchange.getCandles).toHaveBeenCalledWith(
				mockCoin,
				CandleInterval.ONE_MINUTE,
				{ limit: 1 },
			);
			expect(candleRepository.save).toHaveBeenCalledWith(mockCandles);
			expect(result).toEqual({
				coin: mockCoin,
				timestamp: expect.any(String),
			});
		});

		it("캔들 데이터가 없으면 undefined를 반환해야 함", async () => {
			// Arrange
			const mockCoin = "KRW-BTC";
			(exchange.getCandles as jest.Mock).mockResolvedValue([]);

			// Act
			const result = await service.save(mockCoin);

			// Assert
			expect(exchange.getCandles).toHaveBeenCalled();
			expect(candleRepository.save).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it("거래소 API 호출 중 에러가 발생하면 예외를 던져야 함", async () => {
			// Arrange
			const mockCoin = "KRW-BTC";
			const mockError = new Error("API 호출 실패");
			(exchange.getCandles as jest.Mock).mockRejectedValue(mockError);

			// Act & Assert
			await expect(service.save(mockCoin)).rejects.toThrow(mockError);
			expect(exchange.getCandles).toHaveBeenCalled();
			expect(candleRepository.save).not.toHaveBeenCalled();
		});
	});
});
