import {PrismaService} from "@libs/prisma/prisma.service";

export interface IRepository {
    prisma: PrismaService;
}
