import {Injectable} from '@nestjs/common';
import {CoinLogger} from "@libs/logger/coin-logger";

@Injectable()
export class AnalysisService {
  constructor(
      private readonly logger: CoinLogger, // 코인 로거 Coin Logger
  ) {
    this.logger.setContext("AnalysisService");
  }

  /**
   * TODO: 주석 필요
   * @param msg - 코인 정보
   * @returns 캔들 데이터에 따른 스코어링 점수
   */
  async scoring(msg: any): Promise<number> {
    return 0;
  }

  /**
   * TODO: 주석 필요
   * @param score - 점수
   */
  async decision(score: number): Promise<void> {
    throw new Error("Not implements")
  }

}
