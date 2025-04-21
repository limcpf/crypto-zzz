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
								deleteMany: jest.fn().mockImplementation(({ where }) => {
									if (where.symbol) {
										return Promise.resolve({ count: 3 });
									}

									return Promise.resolve({ count: 0 });
								}),
								createMany: jest.fn().mockImplementation(() => {
									// 단순히 입력값을 반환하는 목(mock) 구현
									return Promise.resolve({ count: 1 });
								}),
							},
						},
					},
				],
			}).compile();

			repository = module.get<CandleSaveRepository>(CandleSaveRepository);
			prismaService = module.get<PrismaService>(PrismaService);
		});

		describe("insert method", () => {
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

			it("should call createMany and return the count (unit test)", async () => {
				const mockCreateMany = jest
					.fn()
					.mockResolvedValue({ count: sampleCandles.length });
				jest
					.spyOn(prismaService.candle, "createMany")
					.mockImplementation(mockCreateMany);

				const result = await repository.insert(sampleCandles);
				expect(mockCreateMany).toHaveBeenCalledWith({ data: sampleCandles });
				expect(result).toBe(sampleCandles.length);
			});

			it("should handle zero candles gracefully", async () => {
				const mockCreateMany = jest.fn().mockResolvedValue({ count: 0 });
				jest
					.spyOn(prismaService.candle, "createMany")
					.mockImplementation(mockCreateMany);

				const result = await repository.insert([]);
				expect(result).toBe(0);
			});

			it("should throw an error if createMany throws an exception (e.g., invalid data)", async () => {
				jest
					.spyOn(prismaService.candle, "createMany")
					.mockImplementation(() => {
						throw new Error("Invalid data");
					});
				await expect(repository.insert(sampleCandles)).rejects.toThrow(
					"Invalid data",
				);
			});

			it("should handle empty array input and return 0", async () => {
				jest
					.spyOn(prismaService.candle, "createMany")
					.mockResolvedValue({ count: 0 });
				const result = await repository.insert([]);
				expect(result).toBe(0);
			});

			it("should throw if createMany throws an error", async () => {
				jest
					.spyOn(prismaService.candle, "createMany")
					.mockImplementation(() => {
						throw new Error("DB error");
					});
				await expect(repository.insert(sampleCandles)).rejects.toThrow(
					"DB error",
				);
			});
		});

		describe("upsert method", () => {
			it("should upsert candles using mocked prisma", async () => {
				const result = await repository.upsert(sampleCandles);
				expect(result).toHaveLength(sampleCandles.length);
				expect(prismaService.candle.upsert).toHaveBeenCalledTimes(
					sampleCandles.length,
				);
				expect(result[0].symbol).toBe(sampleCandles[0].symbol);
			});

			it("should throw 'No candles saved' if all upserts fail", async () => {
				jest.spyOn(prismaService.candle, "upsert").mockImplementation(() => {
					throw new Error("DB error");
				});
				await expect(repository.upsert(sampleCandles)).rejects.toThrow(
					"No candles saved",
				);
			});
		});

		describe("deleteAllByCoin method", () => {
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

			it("should handle empty or invalid coin values gracefully", async () => {
				// 빈 문자열
				await expect(repository.deleteAllByCoin("")).resolves.toBe(0);
			});

			it("should handle Prisma deleteMany exception", async () => {
				jest
					.spyOn(prismaService.candle, "deleteMany")
					.mockImplementation(() => {
						throw new Error("Prisma error");
					});
				await expect(repository.deleteAllByCoin("KRW-BTC")).rejects.toThrow(
					"Prisma error",
				);
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

		describe("deleteAllByCoin environment variable test", () => {
			const originalEnv = process.env.environment;

			afterEach(() => {
				process.env.environment = originalEnv;
			});

			it("Exception occurs in production environment", async () => {
				process.env.environment = "production";
				await expect(repository.deleteAllByCoin("KRW-BTC")).rejects.toThrow(
					"Cannot delete all in production",
				);
			});

			it("Works normally in non-production environment", async () => {
				process.env.environment = "development";
				// deleteMany 호출이 정상적으로 수행되어야 함
				const result = await repository.deleteAllByCoin("KRW-BTC");
				expect(result).toBe(3);
			});

			it("Default behavior when environment variable is not set", async () => {
				process.env.environment = undefined;
				const result = await repository.deleteAllByCoin("KRW-BTC");
				expect(result).toBe(3);
			});
		});

		describe("upsert 에러 시 로그 출력 검증", () => {
			it("에러 발생 시 console.log 호출", async () => {
				const consoleSpy = jest
					.spyOn(console, "log")
					.mockImplementation(() => {});
				jest.spyOn(prismaService.candle, "upsert").mockImplementation(() => {
					throw new Error("upsert error");
				});
				await expect(repository.upsert(sampleCandles)).rejects.toThrow(
					"No candles saved",
				);
				expect(consoleSpy).toHaveBeenCalled();
				consoleSpy.mockRestore();
			});
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

			describe("insert method", () => {
				it("should insert candles into real DB and return count", async () => {
					const result = await repository.insert(sampleCandles);
					expect(result).toBe(sampleCandles.length);

					for (const candle of sampleCandles) {
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
			});

			describe("upsert method", () => {
				it("should save candles to real DB", async () => {
					const result = await repository.upsert(sampleCandles);

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
			});

			describe("deleteAllByCoin method", () => {
				it("should delete all candles by coin", async () => {
					const sampleCandle2: Candle = {
						...sampleCandles[0],
						timestamp: new Date("2023-01-01T00:05:00Z"),
					};

					await repository.upsert([...sampleCandles, sampleCandle2]);

					const result = await repository.deleteAllByCoin("KRW-BTC");

					expect(result).toBe(2);
				});

				it("should not throw when no candles exist for the given coin", async () => {
					const result = await repository.deleteAllByCoin("KRW-BTC");

					expect(result).toBe(0);
				});
			});

			describe("Performance and Concurrency Tests for CandleSaveRepository", () => {
				it("should handle large volume of upsert requests concurrently", async () => {
					const largeData: Candle[] = [];
					const date = new Date("2023-01-01T00:00:00Z");
					for (let i = 0; i < 1000; i++) {
						largeData.push({
							symbol: "KRW-BTC",
							timestamp: new Date(date.getTime()),
							openPrice: new Prisma.Decimal(10000),
							closePrice: new Prisma.Decimal(11000),
							highPrice: new Prisma.Decimal(11500),
							lowPrice: new Prisma.Decimal(9500),
							volume: new Prisma.Decimal(100),
						});

						date.setMinutes(date.getMinutes() + 5);
					}

					const promises: unknown[] = [];

					for (let i = 0; i < 10; i++) {
						promises.push(repository.upsert(largeData));
					}
					const promise = await Promise.all(promises);
				}, 30000); // 30초 제한

				it("should process multiple deleteAllByCoin calls concurrently", async () => {
					const repo =
						new (require("./candle-save.repository").CandleSaveRepository)(
							prismaService,
						);
					const promises: unknown[] = [];
					for (let i = 0; i < 10; i++) {
						promises.push(repository.deleteAllByCoin("KRW-BTC"));
					}
					await Promise.all(promises);
				}, 30000);
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
