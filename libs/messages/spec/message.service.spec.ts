import * as fs from "node:fs";
import { join } from "node:path";
import { Test, TestingModule } from "@nestjs/testing";
import { MessageService } from "../message.service";

jest.mock("node:fs");
jest.mock("node:path");

describe("MessageService", () => {
	let service: MessageService;
	const mockJSON = {
		"test.key": "Test Message",
		hello: "Hello, ${1}!",
		welcome: "Welcome ${1} to ${2}",
	};

	beforeEach(async () => {
		// Mock 초기화
		jest.resetAllMocks();
		(join as jest.Mock).mockImplementation((...args) => args.join("/"));
		(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockJSON));

		const module: TestingModule = await Test.createTestingModule({
			providers: [MessageService],
		}).compile();

		service = module.get<MessageService>(MessageService);
	});

	describe("onModuleInit", () => {
		it("영어(en)가 기본 언어로 설정되어야 함", async () => {
			process.env.LANGUAGE = "";

			await service.onModuleInit();
			expect(fs.readFileSync).toHaveBeenCalledWith(
				expect.stringContaining("/en.json"),
				"utf-8",
			);
		});

		it("환경변수에서 지정된 언어를 사용해야 함", async () => {
			process.env.LANGUAGE = "ko";
			await service.onModuleInit();
			expect(fs.readFileSync).toHaveBeenCalledWith(
				expect.stringContaining("/ko.json"),
				"utf-8",
			);
		});

		it("파일 로드 실패시 영어 에러 메시지를 표시해야 함", async () => {
			const languages = ["en", "fr", undefined];

			(fs.readFileSync as jest.Mock).mockImplementation(() => {
				throw new Error();
			});

			for (const language of languages) {
				process.env.LANGUAGE = language;
				await expect(service.onModuleInit()).rejects.toThrow(
					"Failed to load messages",
				);
			}
		});

		it("한국어 설정에서 파일 로드 실패시 한글 에러 메시지를 표시해야 함", async () => {
			process.env.LANGUAGE = "ko";
			(fs.readFileSync as jest.Mock).mockImplementation(() => {
				throw new Error();
			});

			await expect(service.onModuleInit()).rejects.toThrow(
				"메세지 공통 모듈 로드 실패",
			);
		});
	});

	describe("getPlainMessage", () => {
		beforeEach(async () => {
			await service.onModuleInit();
		});

		it("존재하는 키에 대한 메시지를 반환해야 함", () => {
			expect(service.getPlainMessage("test.key")).toBe("Test Message");
		});

		it("존재하지 않는 키의 경우 키 자체를 반환해야 함", () => {
			expect(service.getPlainMessage("non.existing.key")).toBe(
				"non.existing.key",
			);
		});
	});

	describe("getMessage", () => {
		beforeEach(async () => {
			await service.onModuleInit();
		});

		it("파라미터가 없는 메시지를 정상적으로 반환해야 함", () => {
			expect(service.getMessage("test.key")).toBe("Test Message");
		});

		it("단일 파라미터를 정상적으로 치환해야 함", () => {
			expect(service.getMessage("hello", "World")).toBe("Hello, World!");
		});

		it("여러 파라미터를 정상적으로 치환해야 함", () => {
			expect(service.getMessage("welcome", "User", "Service")).toBe(
				"Welcome User to Service",
			);
		});

		it("존재하지 않는 키의 경우 키 자체를 반환해야 함", () => {
			expect(service.getMessage("non.existing.key")).toBe("non.existing.key");
		});
	});
});
