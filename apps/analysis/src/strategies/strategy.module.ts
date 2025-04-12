import {Module} from "@nestjs/common";
import {MA_STRATEGY_REPO} from "@apps/analysis/src/strategies/constants/injection.tokens";
import MaStrategy from "@apps/analysis/src/strategies/ma/ma.strategy";
import MaStrategyRepository from "@apps/analysis/src/strategies/ma/ma.repository";

@Module({
	providers: [
		{
			provide: MA_STRATEGY_REPO,
			useClass: MaStrategyRepository,
		},
	],
	exports: [MaStrategy],
})
class StrategyModule {}

export default StrategyModule;
