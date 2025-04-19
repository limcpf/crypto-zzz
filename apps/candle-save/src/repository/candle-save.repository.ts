// jest --coverage --collectCoverageFrom="apps/candle-save/src/repository/candle-save.repository.ts" apps/candle-save/src/repository/candle-save.repository.spec.ts

import { PrismaService } from "@libs/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Candle } from "@prisma/client";

export interface ICandleSaveRepository {
	save(candles: Candle[]): Promise<Candle[]>;
	deleteAllByCoin(coin: string): Promise<number>;
}

@Injectable()
export class CandleSaveRepository implements ICandleSaveRepository {
	constructor(private readonly prisma: PrismaService) {}

	async save(candles: Candle[]): Promise<Candle[]> {
		const result: Candle[] = [];

		for (const candle of candles) {
			try {
				const candleSaved: Candle = await this.prisma.candle.upsert({
					where: {
						symbol_timestamp: {
							symbol: candle.symbol,
							timestamp: candle.timestamp,
						},
					},
					update: candle,
					create: candle,
				});

				result.push(candleSaved);
			} catch (error) {
				console.log(error);
			}
		}

		if (result.length === 0) {
			throw new Error("No candles saved");
		}

		return result;
	}

	async deleteAllByCoin(coin: string): Promise<number> {
		if (process.env.environment === "production") {
			throw new Error("Cannot delete all in production");
		}

		const { count } = await this.prisma.candle.deleteMany({
			where: {
				symbol: coin,
			},
		});

		return count;
	}
}
