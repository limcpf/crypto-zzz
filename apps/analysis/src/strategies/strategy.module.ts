import { Module } from "@nestjs/common";
import MaStrategy from "@apps/analysis/src/strategies/ma/ma.strategy";
import MaStrategyRepository from "@apps/analysis/src/strategies/ma/ma.repository";
import { StrategyFactory } from "@apps/analysis/src/strategies/strategy.factory";
import {
	MA_STRATEGY,
	MA_STRATEGY_REPO,
} from "@apps/analysis/src/strategies/constants/injection.tokens";
import { PrismaModule } from "@libs/prisma/prisma.module";
import { LoggerModule } from "@libs/logger/logger.module";
import { MessageModule } from "@libs/messages/message.module";

@Module({
	imports: [PrismaModule, LoggerModule, MessageModule],
	providers: [
		StrategyFactory,
		{
			provide: MA_STRATEGY,
			useClass: MaStrategy,
		},
		{
			provide: MA_STRATEGY_REPO,
			useClass: MaStrategyRepository,
		},
	],
	exports: [StrategyFactory],
})
class StrategyModule {}

export default StrategyModule;
