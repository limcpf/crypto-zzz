import {IRepository} from "@libs/common/interfaces/repository.interface";

export interface HourlyClosePrice {
    symbol: string,
    data: HourlyClosePriceData[]
}

export interface HourlyClosePriceData {
    bucket: Date,
    close: number
}

export interface IMaRepository extends IRepository{
    getHourlyClosePrice(coin: string, bucket?: string, day?: number): Promise<HourlyClosePrice>;
}