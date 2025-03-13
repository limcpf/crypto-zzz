/**
 * 지원되는 언어 코드를 정의합니다.
 */
export enum Language {
	ENGLISH = "en",
	KOREAN = "ko",
}

/**
 * 메시지 번역 데이터 타입을 정의합니다.
 */
export type MessageTranslations = Record<string, string>;
