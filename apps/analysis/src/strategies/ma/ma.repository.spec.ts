import MaStrategyRepository from "@apps/analysis/src/strategies/ma/ma.repository";
import {PrismaService} from "@libs/prisma/prisma.service";
import {Test, TestingModule} from "@nestjs/testing";

const mockPrismaService = {
    order: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
};

describe('MaRepository', () => {
    let repo: MaStrategyRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MaStrategyRepository,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        repo = module.get<MaStrategyRepository>(MaStrategyRepository);
    });

    it('getData 가 호출된다.', async () => {
        const param: string = "hello";

        const result = await repo.getData(param);

        console.log(result);

        expect(result).toEqual(param);
    });
})