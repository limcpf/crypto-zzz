import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ["apps/analysis/.env.development", "apps/analysis/.env"],
			isGlobal: true,
		}),
	],
	controllers: [AnalysisController],
	providers: [AnalysisService],
})
export class AnalysisModule {}
