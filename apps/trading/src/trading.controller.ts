import { Controller, Get } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller()
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get()
  getHello(): string {
    return this.tradingService.getHello();
  }
}
