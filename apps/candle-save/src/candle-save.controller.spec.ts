import { Test, TestingModule } from '@nestjs/testing';
import { CandleSaveController } from './candle-save.controller';
import { CandleSaveService } from './candle-save.service';

describe('CandleSaveController', () => {
  let candleSaveController: CandleSaveController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CandleSaveController],
      providers: [CandleSaveService],
    }).compile();

    candleSaveController = app.get<CandleSaveController>(CandleSaveController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(candleSaveController.getHello()).toBe('Hello World!');
    });
  });
});
