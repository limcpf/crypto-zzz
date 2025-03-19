import { HttpClientModule } from "@libs/common/http/http-client.module";
import { HttpClientService } from "@libs/common/http/http-client.service";
import {
	ConsoleLogger,
	ConsoleLoggerOptions,
	Injectable,
	LogLevel,
} from "@nestjs/common";

export interface CoinLoggerOptions extends ConsoleLoggerOptions {
	/**
	 * 디스코드 INFO 웹훅 URL
	 */
	discordInfoWebhookUrl?: string;
	/**
	 * 디스코드 ERROR 웹훅 URL
	 */
	discordErrorWebhookUrl?: string;
	/**
	 * 디스코드로 전송할 최소 로그 레벨
	 */
	minLogLevelForDiscord?: LogLevel;
	/**
	 * 프로덕션 환경에서만 표시할 로그 레벨
	 */
	productionOnlyLogLevels?: LogLevel[];
	/**
	 * 현재 환경 (기본값: development)
	 */
	environment?: "development" | "production" | string;
}

@Injectable()
export class CoinLogger extends ConsoleLogger {
	protected readonly options: CoinLoggerOptions;
	protected readonly isProduction: boolean;

	constructor(
		private readonly httpClient: HttpClientService,
		protected readonly context: string,
		options: CoinLoggerOptions = {},
	) {
		super(context);
		this.options = {
			discordInfoWebhookUrl: process.env.DISCORD_INFO_WEBHOOK_URL,
			discordErrorWebhookUrl: process.env.DISCORD_ERROR_WEBHOOK_URL,
			minLogLevelForDiscord: "error",
			productionOnlyLogLevels: ["debug", "verbose"],
			environment: process.env.NODE_ENV || "development",
			...options,
		};
		this.isProduction = this.options.environment === "production";
	}

	log(message: unknown, context?: string): void {
		if (this.shouldLogInCurrentEnvironment("log")) {
			console.log(message);
			this.sendToDiscordIfNeeded("log", message, context);
		}
	}

	error(message: unknown, trace?: string, context?: string): void {
		if (this.shouldLogInCurrentEnvironment("error")) {
			console.error(message, trace);
			this.sendToDiscordIfNeeded("error", message, context, trace);
		}
	}

	warn(message: unknown, context?: string): void {
		if (this.shouldLogInCurrentEnvironment("warn")) {
			console.warn(message);
			this.sendToDiscordIfNeeded("warn", message, context);
		}
	}

	debug(message: unknown, context?: string): void {
		if (this.shouldLogInCurrentEnvironment("debug")) {
			console.debug(message);
			this.sendToDiscordIfNeeded("debug", message, context);
		}
	}

	verbose(message: unknown, context?: string): void {
		if (this.shouldLogInCurrentEnvironment("verbose")) {
			console.log(message);
			this.sendToDiscordIfNeeded("verbose", message, context);
		}
	}

	/**
	 * 현재 환경에서 해당 로그 레벨을 출력해야 하는지 확인
	 */
	private shouldLogInCurrentEnvironment(level: LogLevel): boolean {
		const productionOnlyLevels = this.options.productionOnlyLogLevels || [];

		if (
			!this.isProduction &&
			productionOnlyLevels.includes(level as LogLevel)
		) {
			return false;
		}

		return true;
	}

	/**
	 * 디스코드로 로그 메시지 전송
	 */
	private async sendToDiscordIfNeeded(
		level: LogLevel,
		message: unknown,
		context?: string,
		trace?: string,
	): Promise<void> {
		// if (process.env.NODE_ENV === "development") {
		// 	return;
		// }

		const minLevel = this.options.minLogLevelForDiscord || "error";
		const levels: LogLevel[] = [
			"verbose",
			"debug",
			"log",
			"warn",
			"error",
			"fatal",
		];

		// 최소 레벨보다 낮은 레벨이면 디스코드로 전송하지 않음
		const minLevelIndex = levels.indexOf(minLevel);
		const currentLevelIndex = levels.indexOf(level as LogLevel);

		if (currentLevelIndex < minLevelIndex && level !== "error") {
			return;
		}

		// 웹훅 URL 선택
		let webhookUrl = this.options.discordInfoWebhookUrl;

		// error 또는 fatal 레벨이면 에러 웹훅 사용 (없으면 info 웹훅 사용)
		if (level === "error" || level === "fatal") {
			webhookUrl =
				this.options.discordErrorWebhookUrl ||
				this.options.discordInfoWebhookUrl;
		}

		if (!webhookUrl) {
			return;
		}

		// 메시지 포맷팅
		const formattedContext = context || this.context;
		const formattedMessage = this.formatMessageForDiscord(
			level,
			message,
			formattedContext,
			trace,
		);

		try {
			await this.httpClient.post(webhookUrl, {
				body: JSON.stringify({
					content: formattedMessage,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error(`[CoinLogger] Failed to send to Discord: ${error.message}`);
		}
	}

	/**
	 * 디스코드 메시지 포맷팅
	 */
	private formatMessageForDiscord(
		level: LogLevel,
		message: unknown,
		context: string,
		trace?: string,
	): string {
		const timestamp = new Date().toLocaleString();
		const environment = this.options.environment;
		let emoji = "📄";

		switch (level) {
			case "error":
			case "fatal":
				emoji = "❌";
				break;
			case "warn":
				emoji = "⚠️";
				break;
			case "debug":
				emoji = "🔍";
				break;
			case "verbose":
				emoji = "📋";
				break;
		}

		let formattedMessage = `${emoji} **[${level.toUpperCase()}]** \`${context}\` (${environment}) - ${timestamp}\n`;

		// 메시지 내용 추가
		if (typeof message === "object") {
			formattedMessage += `\`\`\`json\n${JSON.stringify(message, null, 2)}\`\`\``;
		} else {
			formattedMessage += `\`\`\`\n${String(message)}\`\`\``;
		}

		// 에러 스택 추가
		if (trace) {
			formattedMessage += `\n**Stack Trace:**\n\`\`\`\n${trace}\n\`\`\``;
		}

		// 디스코드 메시지 길이 제한(2000자)에 맞게 조정
		if (formattedMessage.length > 1900) {
			formattedMessage = `${formattedMessage.substring(0, 1900)}... (truncated)`;
		}

		return formattedMessage;
	}

	/**
	 * 커스텀 로그 메시지 전송
	 */
	send(message: unknown, context?: string): void {
		this.log(message, context);
	}
}
