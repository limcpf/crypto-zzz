import {IScoringRepository, ScoringStrategy} from "@apps/analysis/src/strategies/strategy.interface";
import {Inject} from "@nestjs/common";
import {MA_STRATEGY_REPO} from "@apps/analysis/src/strategies/constants/injection.tokens";

class MaStrategy implements ScoringStrategy{
    constructor(
        @Inject(MA_STRATEGY_REPO)
        private readonly repository: IScoringRepository<unknown, [string]>
    ) {}

    async execute(coin: string): Promise<number> {
        await this.repository.getData(coin);

        return 0;
    }
}

export default MaStrategy;