import { NestFactory } from '@nestjs/core';
import { TradingModule } from './trading.module';

async function bootstrap() {
  const app = await NestFactory.create(TradingModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
