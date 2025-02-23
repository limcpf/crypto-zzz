import { Test, TestingModule } from '@nestjs/testing';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';

describe('TradingController', () => {
  let tradingController: TradingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TradingController],
      providers: [TradingService],
    }).compile();

    tradingController = app.get<TradingController>(TradingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(tradingController.getHello()).toBe('Hello World!');
    });
  });
});
