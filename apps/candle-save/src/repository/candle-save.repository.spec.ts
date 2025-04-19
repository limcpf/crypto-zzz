import { Test, TestingModule } from "@nestjs/testing";
import {
	CandleSaveRepository,
	ICandleSaveRepository,
} from "./candle-save.repository";
import { PrismaService } from "@libs/prisma/prisma.service";
import { Candle, Prisma } from "@prisma/client";

describe("CandleSaveRepository", () => {
	let repository: ICandleSaveRepository;
	let prismaService: PrismaService;

	// 샘플 데이터
	const sampleCandles: Candle[] = [
		{
			symbol: "KRW-BTC",
			timestamp: new Date("2023-01-01T00:00:00Z"),
			openPrice: new Prisma.Decimal(10000),
			closePrice: new Prisma.Decimal(11000),
			highPrice: new Prisma.Decimal(11500),
			lowPrice: new Prisma.Decimal(9500),
			volume: new Prisma.Decimal(100),
		},
	];

	describe("Unit Tests (Mocked PrismaService)", () => {
		beforeEach(async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					CandleSaveRepository,
					{
						provide: PrismaService,
						useValue: {
							candle: {
								upsert: jest.fn().mockImplementation((params) => {
									// 단순히 입력값을 반환하는 목(mock) 구현
									return Promise.resolve(params.create);
								}),
								deleteMany: jest.fn().mockImplementation(() => {
									// 단순히 입력값을 반환하는 목(mock) 구현
									return Promise.resolve({ count: 3 });
								}),
							},
						},
					},
				],
			}).compile();

			repository = module.get<CandleSaveRepository>(CandleSaveRepository);
			prismaService = module.get<PrismaService>(PrismaService);
		});

		it("should save candles using mocked prisma", async () => {
			const result = await repository.save(sampleCandles);
			expect(result).toHaveLength(sampleCandles.length);
			expect(prismaService.candle.upsert).toHaveBeenCalledTimes(
				sampleCandles.length,
			);
			expect(result[0].symbol).toBe(sampleCandles[0].symbol);
		});

		it("should throw error if no candles saved", async () => {
			jest.spyOn(prismaService.candle, "upsert").mockImplementation(() => {
				throw new Error("DB error");
			});
			await expect(repository.save(sampleCandles)).rejects.toThrow(
				"No candles saved",
			);
		});

		it("should delete candles using mocked prisma", async () => {
			const coin = "KRW-BTC";
			const result = await repository.deleteAllByCoin(coin);

			expect(prismaService.candle.deleteMany).toHaveBeenCalledWith({
				where: {
					symbol: coin,
				},
			});

			expect(result).toBe(3);
		});

		it("should delete candles on production", async () => {
			const originalEnvironment = process.env.environment;
			process.env.environment = "production";

			await expect(repository.deleteAllByCoin("KRW-BTC")).rejects.toThrow(
				"Cannot delete all in production",
			);

			process.env.environment = originalEnvironment;
		});
	});

	// 통합 테스트는 RUN_INTEGRATION_TESTS 환경변수가 true일 때만 실행
	const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === "true";

	(runIntegrationTests ? describe : describe.skip)(
		"Integration Tests (Real DB)",
		() => {
			beforeAll(async () => {
				if (process.env.TEST_DATABASE_URL === undefined)
					throw new Error("TEST_DATABASE_URL is not defined");

				process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

				// DB 연결
				prismaService = new PrismaService();
				await prismaService.$connect();

				const module: TestingModule = await Test.createTestingModule({
					providers: [CandleSaveRepository, PrismaService],
				}).compile();

				repository = module.get<CandleSaveRepository>(CandleSaveRepository);
				prismaService = module.get<PrismaService>(PrismaService);
			});

			afterAll(async () => {
				await prismaService.$disconnect();
			});

			// save
			it("should save candles to real DB", async () => {
				const result = await repository.save(sampleCandles);

				expect(result).toHaveLength(sampleCandles.length);
				expect(result[0].symbol).toBe(sampleCandles[0].symbol);

				// 테스트 후 데이터 정리
				for (const candle of result) {
					await prismaService.candle.delete({
						where: {
							symbol_timestamp: {
								symbol: candle.symbol,
								timestamp: candle.timestamp,
							},
						},
					});
				}
			});

			// deleteAllByCoin
			it("should delete all candles by coin", async () => {
				const sampleCandle2: Candle = {
					...sampleCandles[0],
					timestamp: new Date("2023-01-01T00:05:00Z"),
				};

				await repository.save([...sampleCandles, sampleCandle2]);

				const result = await repository.deleteAllByCoin("KRW-BTC");

				expect(result).toBe(2);
			});

			it("should not throw when no candles exist for the given coin", async () => {
				const result = await repository.deleteAllByCoin("KRW-BTC");

				expect(result).toBe(0);
			});
		},
	);
});

/**
 * 테스트 실행 방법:
 * - 일반 유닛 테스트 실행 (통합 테스트 제외):
 *   RUN_INTEGRATION_TESTS=false npm test
 *   또는
 *   npm test
 *
 * - 통합 테스트 포함 실행:
 *   RUN_INTEGRATION_TESTS=true npm test
 *
 * 환경변수를 설정하지 않으면 통합 테스트는 자동으로 건너뜁니다.
 */
