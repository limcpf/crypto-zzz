import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class MessageService implements OnModuleInit {
	private messages: Record<string, string> = {};
	private language: string;

	async onModuleInit() {
		this.language = process.env.LANGUAGE || "en"; // 기본값 영어
		this.loadMessages();
	}

	private loadMessages() {
		try {
			const filePath = join(
				__dirname,
				"locales",
				`${this.language || "en"}.json`,
			);
			const fileContent = readFileSync(filePath, "utf-8");
			this.messages = JSON.parse(fileContent);
		} catch (error) {
			switch (this.language) {
				case "ko":
					throw new Error("메세지 공통 모듈 로드 실패");
				default:
					throw new Error(
						`Failed to load messages, this.language: ${this.language ?? "NULL"}`,
					);
			}
		}
	}

	getPlainMessage(key: string): string {
		return this.messages[key] ?? key;
	}

	getMessage(key: string, ...params: string[]): string {
		let message = this.messages[key] || key; // 메시지가 없으면 키를 그대로 반환
		params.forEach((param, index) => {
			message = message.replace(`\${${index + 1}}`, param);
		});
		return message;
	}
}
