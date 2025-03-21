import { CANDLE_SAVE_REPOSITORY } from "@apps/candle-save/src/constants/injection.tokens";
import { ICandleSaveRepository } from "@apps/candle-save/src/repository/candle-save.repository";
import { ExchangeService } from "@libs/exchange/src/exchange.service";
import { CoinLogger } from "@libs/logger/coin-logger";
import { MessageService } from "@libs/messages/message.service";
import { RedisService } from "@libs/redis";
import { Test, TestingModule } from "@nestjs/testing";
import { CandleSaveController } from "./candle-save.controller";
import { CandleSaveService } from "./candle-save.service";

describe("CandleSaveController", () => {
	let candleSaveController: CandleSaveController;
	let candleRepository: ICandleSaveRepository;
	let candleSaveService: CandleSaveService;
	let redisService: RedisService;
	let exchangeService: ExchangeService;
	let logger: CoinLogger;
	let messageService: MessageService;

	beforeEach(async () => {
		const mockCandleRepository = {
			save: jest.fn(),
			findMany: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		const mockLogger = {
			setContext: jest.fn(),
			log: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
			debug: jest.fn(),
			verbose: jest.fn(),
		};

		const mockExchangeService = {
			getExchange: jest.fn(),
			setCredentials: jest.fn(),
			connect: jest.fn(),
			disconnect: jest.fn(),
		};

		const mockRedisService = {
			xadd: jest.fn(),
			xread: jest.fn(),
			xgroup: jest.fn(),
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
			getMessage: jest.fn(),
			getMessageWithParams: jest.fn(),
			onModuleInit: jest.fn(),
		};

		const app: TestingModule = await Test.createTestingModule({
			controllers: [CandleSaveController],
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
		candleSaveService = app.get<CandleSaveService>(CandleSaveService);
		candleRepository = app.get<ICandleSaveRepository>(CANDLE_SAVE_REPOSITORY);
		redisService = app.get<RedisService>(RedisService);
		exchangeService = app.get<ExchangeService>(ExchangeService);
		logger = app.get<CoinLogger>(CoinLogger);
		messageService = app.get<MessageService>(MessageService);
	});

	describe("root", () => {
		it("should be defined", () => {
			expect(candleSaveController).toBeDefined();
			expect(candleSaveService).toBeDefined();
			expect(candleRepository).toBeDefined();
			expect(redisService).toBeDefined();
			expect(exchangeService).toBeDefined();
			expect(logger).toBeDefined();
			expect(messageService).toBeDefined();
		});
	});

	// 여기에 추가적인 테스트 케이스들을 작성할 수 있습니다.
});
