import MaStrategyRepository from "@apps/analysis/src/strategies/ma/ma.repository";
import { PrismaService } from "@libs/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import {
	HourlyClosePriceData,
	IMaRepository,
} from "@apps/analysis/src/strategies/ma/ma.interfaces";

const mockPrismaService = {
	$queryRaw: jest.fn(),
};

describe("MaRepository", () => {
	let repo: IMaRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MaStrategyRepository,
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		repo = module.get<IMaRepository>(MaStrategyRepository);
	});

	it("should return correct results when called with custom bucket and day", async () => {
		const mockResults: HourlyClosePriceData[] = [
			{ bucket: new Date("2023-01-01T00:00:00.000Z"), close: 100 },
			{ bucket: new Date("2023-01-01T01:00:00.000Z"), close: 110 },
		];

		// Prisma 의 $queryRaw 가 호출될 때, 모의 데이터를 반환하도록 설정합니다.
		(mockPrismaService.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

		const coin = "KRW-BTC";
		const bucket = "60 minutes"; // 테스트로 전달할 bucket 값
		const day = 26; // 테스트로 전달할 day 값

		const result = await repo.getHourlyClosePrice(coin, bucket, day);

		// prisma.$queryRaw 가 호출되었는지 확인합니다.
		expect(mockPrismaService.$queryRaw).toHaveBeenCalled();

		// repository 가 반환한 결과가 mock 데이터와 일치하는지 확인합니다.
		// (여기서는 cast 때문에 반환되는 필드명이 close 지만, 필요에 따라 결과를 가공할 수 있습니다.)
		expect(result).toEqual({
			symbol: coin,
			data: mockResults,
		});
	});

	it("should use default bucket and day if not provided", async () => {
		const mockResults: HourlyClosePriceData[] = [
			{ bucket: new Date("2023-01-01T00:00:00.000Z"), close: 100 },
			{ bucket: new Date("2023-01-01T01:00:00.000Z"), close: 110 },
		];

		(mockPrismaService.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

		const coin = "KRW-BTC";

		const result = await repo.getHourlyClosePrice(coin);

		expect(mockPrismaService.$queryRaw).toHaveBeenCalled();

		expect(result).toEqual({
			symbol: coin,
			data: mockResults,
		});
	});
});
