import {Injectable} from "@nestjs/common";
import {HourlyClosePriceData, IMaRepository} from "@apps/analysis/src/strategies/ma/ma.interfaces";
import {PrismaService} from "@libs/prisma/prisma.service";

@Injectable()
class MaStrategyRepository implements IMaRepository {
    prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.prisma = prisma;
    }

    async getHourlyClosePrice(coin: string, bucket = "60 minutes", day = 26) {
        const results = await this.prisma.$queryRaw<HourlyClosePriceData[]>`
            SELECT time_bucket(${bucket}, "timestamp") AS bucket,
                last("close", "timestamp") AS "close"
            FROM "CANDLE"
            WHERE "date" >= NOW() - INTERVAL '${day} days'
                AND "symbol" = '${coin}'
            GROUP BY bucket
            ORDER BY bucket;        
        `;

        return {
            symbol: coin,
            data: results
        };
    }
}

export default MaStrategyRepository;