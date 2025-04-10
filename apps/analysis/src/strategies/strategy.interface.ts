import {PrismaService} from "@libs/prisma/prisma.service";

export interface IScoringRepository<T, A extends unknown[] = unknown[]> {
    prisma: PrismaService;
    getData(...args: A): Promise<T>;
}

/**
 * 매수/매도를 위한 전략의 인터페이스
 */
export interface ScoringStrategy {
    /**
     * 캔들 데이터를 기반으로 점수 계산
     * @param coin 코인 이름
     * @return -1 ~ 1 사이의 점수
     */
     execute(coin: string): Promise<number>;
}