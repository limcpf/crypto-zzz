import { CoinLogger } from "@libs/logger/coin-logger";
import { MessageService } from "@libs/messages/message.service";
import { RedisService } from "@libs/redis";
import { Test, TestingModule } from "@nestjs/testing";
import { CandleSaveController } from "./candle-save.controller";
import { CandleSaveService } from "./candle-save.service";

const mockLogger = {
	setContext: jest.fn(),
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	debug: jest.fn(),
	verbose: jest.fn(),
};

const mockRedisService = {
	xadd: jest.fn(),
	xread: jest.fn(),
	xgroup: jest.fn(),
	xreadgroup: jest.fn(),
	xack: jest.fn(),
	xdel: jest.fn(),
	xlen: jest.fn(),
	xtrim: jest.fn(),
	xrange: jest.fn(),
	xrevrange: jest.fn(),
	xpending: jest.fn(),
	xclaim: jest.fn(),
};

const mockMessageService = {
	getPlainMessage: jest.fn(),
};

const mockCandleSaveService = {
	upsert: jest.fn(),
	replacePriorDataByCoin: jest.fn(),
	deleteCandlesByCoin: jest.fn(),
};
describe("CandleSaveController", () => {
	let candleSaveController: CandleSaveController;

	beforeEach(async () => {
		jest.clearAllMocks();

		const app: TestingModule = await Test.createTestingModule({
			controllers: [CandleSaveController],
			providers: [
				{
					provide: CandleSaveService,
					useValue: mockCandleSaveService,
				},
				{
					provide: CoinLogger,
					useValue: mockLogger,
				},
				{
					provide: RedisService,
					useValue: mockRedisService,
				},
				{
					provide: MessageService,
					useValue: mockMessageService,
				},
			],
		}).compile();

		candleSaveController = app.get<CandleSaveController>(CandleSaveController);
	});

	describe("processOneBatch", () => {
		it("should process messages correctly when results exist", async () => {
			const messageId = "123-0";
			const messageContent = "test-message";
			const candleSavedResult = { id: 1, data: "saved" };

			(mockRedisService.xreadgroup as jest.Mock).mockResolvedValue([
				["candle", [[messageId, ["field", messageContent]]]],
			]);
			(mockCandleSaveService.upsert as jest.Mock).mockResolvedValue(
				candleSavedResult,
			);
			(mockRedisService.xadd as jest.Mock).mockResolvedValue("some-id");
			(mockRedisService.xack as jest.Mock).mockResolvedValue(1);

			await candleSaveController.processOneBatch();

			expect(mockRedisService.xreadgroup).toHaveBeenCalledWith(
				"candle-save",
				process.env.CONSUMER || "consumer-1",
				{ candle: ">" },
				1,
				0,
			);
			expect(mockCandleSaveService.upsert).toHaveBeenCalledWith(messageContent);
			expect(mockRedisService.xadd).toHaveBeenCalledWith(
				"analysis",
				candleSavedResult,
			);
			expect(mockRedisService.xack).toHaveBeenCalledWith(
				"candle",
				"candle-save",
				messageId,
			);
		});

		it("should handle no results gracefully", async () => {
			(mockRedisService.xreadgroup as jest.Mock).mockResolvedValue(null);

			await candleSaveController.processOneBatch();

			expect(mockRedisService.xreadgroup).toHaveBeenCalled();
			expect(mockCandleSaveService.upsert).not.toHaveBeenCalled();
			expect(mockRedisService.xadd).not.toHaveBeenCalled();
			expect(mockRedisService.xack).not.toHaveBeenCalled();
		});

		it("should log error and wait on exception", async () => {
			const error = new Error("test error");
			(mockRedisService.xreadgroup as jest.Mock).mockRejectedValue(error);
			const loggerErrorSpy = jest.spyOn(mockLogger, "error");
			const loggerDebugSpy = jest.spyOn(mockLogger, "debug");
			const messageServiceSpy = jest
				.spyOn(mockMessageService, "getPlainMessage")
				.mockReturnValue("Error processing stream");

			const setTimeoutSpy = jest.spyOn(global, "setTimeout");

			await candleSaveController.processOneBatch();

			expect(loggerErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error processing stream - Error: test error"),
				error.stack,
			);
			expect(messageServiceSpy).toHaveBeenCalledWith("ERROR_STREAM_PROCESSING");
			expect(setTimeoutSpy).toHaveBeenCalled();
		});
	});
});
