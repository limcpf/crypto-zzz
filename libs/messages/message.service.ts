import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CoinLogger } from "@libs/logger/coin-logger";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Language, MessageTranslations } from "./language.type";
import { MessageKey } from "./message-keys";

@Injectable()
export class MessageService implements OnModuleInit {
	constructor(private readonly logger: CoinLogger) {}

	private messages: Record<Language, MessageTranslations> = {
		[Language.ENGLISH]: {},
		[Language.KOREAN]: {},
	};
	private currentLanguage: Language;

	async onModuleInit(): Promise<void> {
		const languageEnv = process.env.LANGUAGE || Language.ENGLISH;
		this.currentLanguage = Object.values(Language).includes(
			languageEnv as Language,
		)
			? (languageEnv as Language)
			: Language.ENGLISH;

		this.loadAllMessages();
	}

	/**
	 * 모든 지원 언어의 메시지 파일을 로드합니다.
	 */
	private loadAllMessages(): void {
		try {
			const filePath = join(
				process.cwd(),
				"libs",
				"messages",
				"locales",
				`${this.currentLanguage}.json`,
			);
			const fileContent = readFileSync(filePath, "utf-8");
			this.messages[this.currentLanguage] = JSON.parse(fileContent);
			this.logger.log(`Loaded messages for language: ${this.currentLanguage}`);
		} catch (error) {
			this.logger.error(
				`Failed to load messages for language: ${this.currentLanguage}`,
				error,
			);
			// 기본 영어 메시지는 항상 필요하므로 영어가 로드되지 않으면 오류를 발생시킵니다.
			if (this.currentLanguage === Language.ENGLISH) {
				throw new Error("Failed to load essential English messages");
			}
		}
	}

	/**
	 * 현재 설정된 언어를 반환합니다.
	 */
	getCurrentLanguage(): Language {
		return this.currentLanguage;
	}

	/**
	 * 언어를 변경합니다.
	 * @param language 설정할 언어
	 */
	setLanguage(language: Language): void {
		if (!Object.values(Language).includes(language)) {
			this.logger.warn(
				`Unsupported language: ${language}, falling back to English`,
			);
			this.currentLanguage = Language.ENGLISH;
			return;
		}

		this.currentLanguage = language;
		this.logger.log(`Language changed to: ${language}`);
	}

	/**
	 * 특정 키에 해당하는 메시지를 가져옵니다.
	 * @param key 메시지 키
	 * @returns 메시지 텍스트
	 */
	getPlainMessage(key: MessageKey | string): string {
		return this.getMessageFromLanguage(this.currentLanguage, key);
	}

	/**
	 * 특정 키에 해당하는 메시지를 가져오고 파라미터를 적용합니다.
	 * @param key 메시지 키
	 * @param params 메시지에 삽입될 파라미터 배열
	 * @returns 파라미터가 적용된 메시지 텍스트
	 */
	getMessage(key: MessageKey | string, ...params: string[]): string {
		let message = this.getMessageFromLanguage(this.currentLanguage, key);

		params.forEach((param, index) => {
			message = message.replace(`\${${index + 1}}`, param);
		});

		return message;
	}

	/**
	 * 특정 언어의 메시지를 가져옵니다. 없을 경우 대체 처리합니다.
	 * @param language 언어 코드
	 * @param key 메시지 키
	 * @returns 해당 언어의 메시지
	 */
	private getMessageFromLanguage(
		language: Language,
		key: MessageKey | string,
	): string {
		// 요청된 언어에 메시지가 있으면 반환
		if (this.messages[language]?.[key]) {
			return this.messages[language][key];
		}

		// 요청된 언어에 메시지가 없으면 영어 메시지 사용
		if (
			language !== Language.ENGLISH &&
			this.messages[Language.ENGLISH]?.[key]
		) {
			this.logger.warn(
				`Missing translation for key "${key}" in language "${language}", using English`,
			);
			return this.messages[Language.ENGLISH][key];
		}

		// 영어 메시지도 없으면 키 자체를 반환
		this.logger.warn(`Missing message for key "${key}" in all languages`);
		return key;
	}
}
