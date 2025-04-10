import {Injectable} from "@nestjs/common";
import {IScoringRepository} from "@apps/analysis/src/strategies/strategy.interface";
import {PrismaService} from "@libs/prisma/prisma.service";

@Injectable()
class MaStrategyRepository implements IScoringRepository<unknown, [string]> {
    prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.prisma = prisma;
    }
    async getData(param: string): Promise<string> {
        return param;
    }
}

export default MaStrategyRepository;