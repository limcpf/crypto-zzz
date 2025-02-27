import { Test, TestingModule } from '@nestjs/testing';
import { CronSignalController } from './cron-signal.controller';
import { CronSignalService } from './cron-signal.service';

describe('CronSignalController', () => {
  let cronSignalController: CronSignalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CronSignalController],
      providers: [CronSignalService],
    }).compile();

    cronSignalController = app.get<CronSignalController>(CronSignalController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cronSignalController.getHello()).toBe('Hello World!');
    });
  });
});
