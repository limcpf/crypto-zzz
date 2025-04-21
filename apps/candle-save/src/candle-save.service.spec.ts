import { Test, TestingModule } from "@nestjs/testing";
import { CandleSaveService } from "./candle-save.service";
import { CANDLE_SAVE_REPOSITORY } from "./constants/injection.tokens";
import { ICandleSaveRepository } from "./repository/candle-save.repository";
import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { CoinLogger } from "@libs/logger/coin-logger";
import { CandleInterval } from "@libs/exchange/src/models/common.model";
import { Candle } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { IExchangeImpl } from "@libs/exchange/src/interfaces/exchange-impl.interface";

describe("CandleSaveService - updateCandleData", () => {
	let service: CandleSaveService;
	let candleRepository: ICandleSaveRepository;
	let exchangeService: ExchangeService;
	let exchange: IExchangeImpl;
	let logger: CoinLogger;

	beforeEach(async () => {
		const mockCandleRepository: Partial<ICandleSaveRepository> = {
			deleteAllByCoin: jest.fn().mockResolvedValue(10),
			insert: jest.fn(),
			upsert: jest.fn().mockResolvedValue([
				{
					symbol: "KRW-BTC",
					timestamp: new Date(),
				},
			]),
		};

		const mockExchange = {
			getCandles: jest.fn(),
		};

		const mockExchangeService = {
			getExchange: jest.fn().mockReturnValue(mockExchange),
		};

		const mockLogger = {
			setContext: jest.fn(),
			debug: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

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

	// upsert 메서드 테스트
	describe("upsert", () => {
		it("코인 캔들 데이터를 성공적으로 저장해야 함", async () => {
			const mockCoin = "KRW-BTC";
			const mockTimestamp = new Date();
			const mockCandles: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			];

			(exchange.getCandles as jest.Mock).mockResolvedValue(mockCandles);
			(candleRepository.upsert as jest.Mock).mockResolvedValue(mockCandles);

			// Act
			const result = await service.upsert(mockCoin);

			// Assert
			expect(exchange.getCandles).toHaveBeenCalledWith(
				mockCoin,
				CandleInterval.ONE_MINUTE,
				{ limit: 1 },
			);
			expect(candleRepository.upsert).toHaveBeenCalledWith(mockCandles);
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
			const result = await service.upsert(mockCoin);

			// Assert
			expect(exchange.getCandles).toHaveBeenCalled();
			expect(candleRepository.upsert).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it("거래소 API 호출 중 에러가 발생하면 예외를 던져야 함", async () => {
			// Arrange
			const mockCoin = "KRW-BTC";
			const mockError = new Error("API 호출 실패");
			(exchange.getCandles as jest.Mock).mockRejectedValue(mockError);

			// Act & Assert
			await expect(service.upsert(mockCoin)).rejects.toThrow(mockError);
			expect(exchange.getCandles).toHaveBeenCalled();
			expect(candleRepository.upsert).not.toHaveBeenCalled();
		});

		it("존재하는 캔들이 있을 때, 업데이트가 제대로 되는지 검증", async () => {
			const mockCoin = "KRW-BTC";
			const mockCandles: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			];

			(exchange.getCandles as jest.Mock).mockResolvedValue(mockCandles);
			(candleRepository.upsert as jest.Mock).mockResolvedValue(mockCandles);

			const result = await service.upsert(mockCoin);

			expect(exchange.getCandles).toHaveBeenCalledWith(
				mockCoin,
				CandleInterval.ONE_MINUTE,
				{ limit: 1 },
			);
			expect(candleRepository.upsert).toHaveBeenCalledWith(mockCandles);
			expect(result).toEqual({
				coin: mockCoin,
				timestamp: expect.any(String),
			});
		});

		it("Prisma가 예외를 던질 때, 서비스가 적절히 처리하는지 검증", async () => {
			const mockCoin = "KRW-BTC";
			const mockError = new Error("DB 저장 실패");
			(exchange.getCandles as jest.Mock).mockResolvedValue([
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			]);
			(candleRepository.upsert as jest.Mock).mockRejectedValue(mockError);

			await expect(service.upsert(mockCoin)).rejects.toThrow("DB 저장 실패");
			expect(exchange.getCandles).toHaveBeenCalled();
			expect(candleRepository.upsert).toHaveBeenCalled();
		});
	});

	// replacePriorDataByCoin 메서드 테스트
	describe("replacePriorDataByCoin", () => {
		const mockCoin = "KRW-BTC";

		it("성공적으로 기존 데이터 삭제 후 새 데이터 저장 후 반환값 검증", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(10);
			const mockCandles: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			];
			jest.spyOn(service, "fetchCandlesByCoin").mockResolvedValue(mockCandles);
			(candleRepository.insert as jest.Mock).mockResolvedValue(
				mockCandles.length,
			);

			const result = await service.replacePriorDataByCoin(mockCoin, 3);

			expect(candleRepository.deleteAllByCoin).toHaveBeenCalledWith(mockCoin);
			expect(service.fetchCandlesByCoin).toHaveBeenCalledWith(
				mockCoin,
				expect.any(Number),
				expect.any(Date),
			);
			expect(candleRepository.insert).toHaveBeenCalledWith(mockCandles);
			expect(result).toBe(mockCandles.length);
		});

		it("삭제 중 'production' 메시지 포함 시 warn 메시지 출력", async () => {
			const error = new Error("production error");
			(candleRepository.deleteAllByCoin as jest.Mock).mockRejectedValue(error);
			const warnSpy = jest
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				.spyOn(service["logger"], "warn")
				.mockImplementation(() => {});

			await service.replacePriorDataByCoin(mockCoin, 3).catch(() => {});

			expect(warnSpy).toHaveBeenCalledWith(
				"production에서는 데이터를 삭제할 수 없습니다!",
			);
			warnSpy.mockRestore();
		});

		it("삭제 중 일반 에러 발생 시 예외 던짐", async () => {
			const error = new Error("some error");
			(candleRepository.deleteAllByCoin as jest.Mock).mockRejectedValue(error);

			await expect(service.replacePriorDataByCoin(mockCoin, 3)).rejects.toThrow(
				"some error",
			);
		});

		it("fetchCandlesByCoin 호출 실패 시 예외 던짐", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(10);
			jest
				.spyOn(service, "fetchCandlesByCoin")
				.mockRejectedValue(new Error("fetch error"));

			await expect(service.replacePriorDataByCoin(mockCoin, 3)).rejects.toThrow(
				"fetch error",
			);
		});

		it("candleRepository.insert 실패 시 예외 던짐", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(10);
			jest.spyOn(service, "fetchCandlesByCoin").mockResolvedValue([
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			]);
			(candleRepository.insert as jest.Mock).mockRejectedValue(
				new Error("insert error"),
			);

			await expect(service.replacePriorDataByCoin(mockCoin, 3)).rejects.toThrow(
				"insert error",
			);
		});

		it("should throw if insert fails", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(0);
			jest.spyOn(service, "fetchCandlesByCoin").mockResolvedValue([]);
			(candleRepository.insert as jest.Mock).mockRejectedValue(
				new Error("DB insert error"),
			);
			await expect(service.replacePriorDataByCoin("BTC")).rejects.toThrow(
				"DB insert error",
			);
		});
	});

	// deleteCandlesByCoin 메서드 테스트
	describe("deleteCandlesByCoin", () => {
		const mockCoin = "KRW-BTC";

		it("정상적으로 deleteAllByCoin 호출 후 반환값 검증", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(5);

			const result = await service.deleteCandlesByCoin(mockCoin);

			expect(candleRepository.deleteAllByCoin).toHaveBeenCalledWith(mockCoin);
			expect(result).toBe(5);
		});

		it("에러 발생 시 'production' 메시지 포함하면 warn 호출 후 0 반환", async () => {
			const error = new Error("production error");
			(candleRepository.deleteAllByCoin as jest.Mock).mockRejectedValue(error);
			const warnSpy = jest
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				.spyOn(service["logger"], "warn")
				.mockImplementation(() => {});

			const result = await service.deleteCandlesByCoin(mockCoin);

			expect(warnSpy).toHaveBeenCalledWith(
				"production에서는 데이터를 삭제할 수 없습니다!",
			);
			expect(result).toBe(0);
			warnSpy.mockRestore();
		});

		it("에러 발생 시 'production' 메시지 없으면 예외 던짐", async () => {
			const error = new Error("some error");
			(candleRepository.deleteAllByCoin as jest.Mock).mockRejectedValue(error);

			await expect(service.deleteCandlesByCoin(mockCoin)).rejects.toThrow(
				"some error",
			);
		});

		it("should throw if deleteCandlesByCoin fails", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockRejectedValue(
				new Error("DB error"),
			);
			await expect(service.replacePriorDataByCoin("BTC")).rejects.toThrow(
				"DB error",
			);
		});
	});

	// fetchCandlesByCoin 메서드 테스트
	describe("fetchCandlesByCoin", () => {
		const mockCoin = "KRW-BTC";

		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("여러 번 호출하여 캔들 데이터를 누적해서 반환해야 함", async () => {
			const mockCandlesBatch1: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50000),
					highPrice: new Decimal(51000),
					lowPrice: new Decimal(49000),
					closePrice: new Decimal(50500),
					volume: new Decimal(100),
				},
			];
			const mockCandlesBatch2: Candle[] = [
				{
					symbol: mockCoin,
					timestamp: new Date(),
					openPrice: new Decimal(50500),
					highPrice: new Decimal(51500),
					lowPrice: new Decimal(49500),
					closePrice: new Decimal(51000),
					volume: new Decimal(150),
				},
			];

			// 첫 호출에 200개, 두번째 호출에 50개 반환하는 시뮬레이션
			(exchange.getCandles as jest.Mock)
				.mockResolvedValueOnce(mockCandlesBatch1)
				.mockResolvedValueOnce(mockCandlesBatch2);

			const count = 250;
			const result = await service.fetchCandlesByCoin(mockCoin, count);

			expect(exchange.getCandles).toHaveBeenCalledTimes(2);
			expect(result.length).toBe(
				mockCandlesBatch1.length + mockCandlesBatch2.length,
			);
		});

		it("캔들 데이터가 없으면 빈 배열 반환", async () => {
			(exchange.getCandles as jest.Mock).mockResolvedValue([]);

			const result = await service.fetchCandlesByCoin(mockCoin, 100);

			expect(result).toEqual([]);
		});

		it("should throw if fetchCandlesByCoin fails", async () => {
			(candleRepository.deleteAllByCoin as jest.Mock).mockResolvedValue(0);
			jest
				.spyOn(service, "fetchCandlesByCoin")
				.mockRejectedValue(new Error("API failure"));
			await expect(service.replacePriorDataByCoin("BTC")).rejects.toThrow(
				"API failure",
			);
		});
	});

	// calcCandlesBetweenDates 메서드 테스트
	describe("calcCandlesBetweenDates", () => {
		it("두 날짜 사이의 캔들 개수를 올바르게 계산해야 함", () => {
			const startDate = new Date("2025-04-01T00:00:00Z");
			const endDate = new Date("2025-04-01T01:00:00Z"); // 1시간 차이

			const result = service.calcCandlesBetweenDates(startDate, endDate);

			// 1시간 = 60분, 5분 단위 캔들 => 12개
			expect(result).toBe(12);
		});

		it("시작 날짜가 끝 날짜보다 이후여도 올바르게 계산해야 함", () => {
			const startDate = new Date("2025-04-02T00:00:00Z");
			const endDate = new Date("2025-04-01T00:00:00Z");

			const result = service.calcCandlesBetweenDates(startDate, endDate);

			expect(result).toBe(288);
		});

		it("시작 날짜가 끝 날짜보다 이후면 0 반환", () => {
			const startDate = new Date("2025-04-01T00:00:00Z");
			const endDate = new Date("2025-04-01T00:00:00Z");

			const result = service.calcCandlesBetweenDates(startDate, endDate);

			expect(result).toBe(0);
		});
	});
});
