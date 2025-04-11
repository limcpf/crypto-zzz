import {Injectable} from "@nestjs/common";
import {IMaRepository} from "@apps/analysis/src/strategies/ma/ma.interfaces";
import {PrismaService} from "@libs/prisma/prisma.service";

@Injectable()
class MaStrategyRepository implements IMaRepository {
    prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.prisma = prisma;
    }

    async getHourlyStockPrices(bucket: string = "60 minutes", day: number = 26) {
        const results = await this.prisma.$queryRaw`
            SELECT time_bucket(${bucket}, "timestamp") AS bucket,
                last("close", "timestamp") AS "close"
            FROM "CANDLE"
            WHERE "date" >= NOW() - INTERVAL '${day} days'
            GROUP BY bucket
            ORDER BY bucket;        
        `;

        return results as Array<{ bucket: Date; avgClose: number }>;
    }
}

export default MaStrategyRepository;