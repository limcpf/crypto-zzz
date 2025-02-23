import { Injectable } from '@nestjs/common';

@Injectable()
export class TradingService {
  getHello(): string {
    return 'Hello World!';
  }
}
