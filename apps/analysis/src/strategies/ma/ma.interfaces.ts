import {IRepository} from "@libs/common/interfaces/repository.interface";

export interface IMaRepository extends IRepository{
    getHourlyStockPrices(bucket?: string, day?: number): Promise<{bucket: Date, avgClose: number}[]>;
}