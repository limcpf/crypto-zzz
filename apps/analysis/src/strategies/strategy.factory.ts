import {Inject, Injectable} from "@nestjs/common";
import {AnalysisStrategy} from "@apps/analysis/src/strategies/strategy.interface";
import {MA_STRATEGY} from "@apps/analysis/src/strategies/constants/injection.tokens";
import MaStrategy from "@apps/analysis/src/strategies/ma/ma.strategy";
import {MessageService} from "@libs/messages/message.service";

type ScoringType = 'ma' | string;

@Injectable()
export class ScoringFactory {
    constructor(
        @Inject(MA_STRATEGY) private readonly maStrategy: MaStrategy,
        private readonly messageService: MessageService
    ) {

    }
    getStrategy(type: ScoringType): AnalysisStrategy {
        switch (type) {
            case "ma":
                return this.maStrategy;
            default:
                throw new Error(this.messageService.getMessage("STRATEGY_NOT_FOUND", type));
        }
    }
}