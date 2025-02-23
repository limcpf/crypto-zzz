import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';

@Module({
  imports: [],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
