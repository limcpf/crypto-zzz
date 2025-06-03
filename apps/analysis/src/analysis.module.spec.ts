import { Test, TestingModule } from "@nestjs/testing";
import { AnalysisModule } from "@apps/analysis/src/analysis.module";
import { AnalysisService } from "@apps/analysis/src/analysis.service";

describe("AnalysisModule", () => {
	let moduleRef: TestingModule;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [AnalysisModule],
		}).compile();
	});

	it("should have all module dependencies properly injected", () => {
		const analysisService = moduleRef.get<AnalysisService>(AnalysisService);

		expect(analysisService).toBeDefined();
	});
});
