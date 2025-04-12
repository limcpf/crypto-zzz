import {AnalysisStrategy} from "@apps/analysis/src/strategies/strategy.interface";
import {Inject} from "@nestjs/common";
import {MA_STRATEGY_REPO} from "@apps/analysis/src/strategies/constants/injection.tokens";
import {IMaRepository} from "@apps/analysis/src/strategies/ma/ma.interfaces";
import * as process from "node:process";

class MaStrategy implements AnalysisStrategy {
	private readonly MA_LONG_TERM_DAYS: number;
	private readonly MA_MIDDLE_TERM_DAYS: number;
	private readonly MA_SHORT_TERM_DAYS: number;

	constructor(
		@Inject(MA_STRATEGY_REPO)
		private readonly repository: IMaRepository,
	) {
		this.MA_LONG_TERM_DAYS = Number(process.env.MA_LONG_TERM_DAYS) || 26;
		this.MA_MIDDLE_TERM_DAYS = Number(process.env.MA_MIDDLE_TERM_DAYS) || 12;
		this.MA_SHORT_TERM_DAYS = Number(process.env.MA_MIDDLE_TERM_DAYS) || 9;
	}

	async execute(coin: string): Promise<number> {
		return 0;
	}

	async getEMA() {}
}

export default MaStrategy;
