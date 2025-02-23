import { Controller, Get } from '@nestjs/common';
import { CandleSaveService } from './candle-save.service';

@Controller()
export class CandleSaveController {
  constructor(private readonly candleSaveService: CandleSaveService) {}

  @Get()
  getHello(): string {
    return this.candleSaveService.getHello();
  }
}
