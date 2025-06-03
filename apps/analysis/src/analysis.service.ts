import { Injectable } from "@nestjs/common";
import { CoinLogger } from "@libs/logger/coin-logger";
import { StrategyFactory } from "@apps/analysis/src/strategies/strategy.factory";

@Injectable()
export class AnalysisService {
	private readonly strategies: string[];

	constructor(
		private readonly logger: CoinLogger, // 코인 로거 Coin Logger
		private readonly scoringFactory: StrategyFactory,
	) {
		this.logger.setContext("AnalysisService");

		// TODO: main.ts에 설정에 있는 전략은 몇개고 실제 불러와진건 몇갠지 테스트?

		const enabledStrategies = process.env.ENABLED_STRATEGIES || "ma";
		this.strategies = enabledStrategies.split(",").filter((s) => s);
	}

	/**
	 * TODO: 주석 필요
	 * @param msg - 코인 정보
	 * @returns 캔들 데이터에 따른 스코어링 점수
	 */
	async scoring(msg: unknown): Promise<unknown> {
		const { coin }: { coin: string } = JSON.parse(msg as string);

		const strategy = this.scoringFactory.getStrategy("ma");

		const data = strategy.execute(coin);

		return;
	}

	/**
	 * TODO: 주석 필요
	 * @param score - 점수
	 */
	async decision(score: number): Promise<void> {
		console.log(score);
		throw new Error("Not implements");
	}
}
