import { Controller, Get } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get()
  getHello(): string {
    return this.analysisService.getHello();
  }
}
