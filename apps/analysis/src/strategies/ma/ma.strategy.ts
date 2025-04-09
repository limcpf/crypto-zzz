import {CandleAnalysisStrategy, IStrategyRepository} from "@apps/analysis/src/strategies/strategy.interface";
import {Candle} from "@prisma/client";
import {Inject} from "@nestjs/common";
import {MA_STRATEGY_REPO} from "@apps/analysis/src/strategies/constants/injection.tokens";

class MaStrategy implements CandleAnalysisStrategy{
    constructor(
        @Inject(MA_STRATEGY_REPO)
        private readonly repository: IStrategyRepository<unknown, [string]>
    ) {}

    async scoring(candles: Candle[]): Promise<number> {
        await this.repository.getData("");

        return 0;
    }
}

export default MaStrategy;