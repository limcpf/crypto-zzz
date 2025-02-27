import { Test, TestingModule } from "@nestjs/testing";
import { CronSignalController } from "./cron-signal.controller";

describe("CronSignalController", () => {
	let cronSignalController: CronSignalController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [CronSignalController],
			providers: [],
		}).compile();

		cronSignalController = app.get<CronSignalController>(CronSignalController);
	});

	describe("root", () => {
		it('should return "Hello World!"', () => {
			expect(cronSignalController.getHello()).toBe("Hello World!");
		});
	});
});
