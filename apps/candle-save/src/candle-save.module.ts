import { Module } from '@nestjs/common';
import { CandleSaveController } from './candle-save.controller';
import { CandleSaveService } from './candle-save.service';

@Module({
  imports: [],
  controllers: [CandleSaveController],
  providers: [CandleSaveService],
})
export class CandleSaveModule {}
