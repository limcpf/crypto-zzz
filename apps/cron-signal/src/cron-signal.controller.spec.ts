import { RedisService } from "@libs/redis";
import { Test, TestingModule } from "@nestjs/testing";
import { CronSignalController } from "./cron-signal.controller";

describe("CronSignalController", () => {
	let cronSignalController: CronSignalController;
	let redisService: RedisService;

	/** Redis Service Mock */
	const mockRedisService = {
		xadd: jest.fn(),
	};

	beforeEach(async () => {
		process.env.COINS = "BTC,ETH";
		process.env.UNIT = "KRW";

		const app: TestingModule = await Test.createTestingModule({
			controllers: [CronSignalController],
			providers: [
				{
					provide: RedisService,
					useValue: mockRedisService,
				},
			],
		}).compile();

		cronSignalController = app.get<CronSignalController>(CronSignalController);
		redisService = app.get<RedisService>(RedisService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("saveCandleData", () => {
		it("각각의 코인들에 대한 캔들 저장 신호 발생 여부 체크", async () => {
			const strDate = "2025-03-01T00:00:00.000Z";
			const mockDate = new Date(strDate);
			const orgDate = global.Date;

			global.Date = jest.fn(() => mockDate) as unknown as DateConstructor;
			global.Date.now = orgDate.now;

			await cronSignalController.saveCandleData();

			expect(mockRedisService.xadd).toHaveBeenCalledTimes(
				process.env.COINS?.split(",").length || 0,
			);

			expect(mockRedisService.xadd).toHaveBeenCalledWith("candle", {
				ticker: "KRW-BTC",
				timestamp: strDate,
			});

			expect(mockRedisService.xadd).toHaveBeenCalledWith("candle", {
				ticker: "KRW-ETH",
				timestamp: strDate,
			});

			global.Date = orgDate;
		});
	});
});
