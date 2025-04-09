import {Injectable} from "@nestjs/common";
import {IStrategyRepository} from "@apps/analysis/src/strategies/strategy.interface";

@Injectable()
class MaStrategyRepository implements IStrategyRepository<unknown, [string]> {
    async getData(param: string): Promise<unknown> {
        return;
    }
}

export default MaStrategyRepository;