import {Injectable} from "@nestjs/common";
import {IScoringRepository} from "@apps/analysis/src/strategies/strategy.interface";

@Injectable()
class MaStrategyRepository implements IScoringRepository<unknown, [string]> {
    async getData(param: string): Promise<unknown> {
        return;
    }
}

export default MaStrategyRepository;