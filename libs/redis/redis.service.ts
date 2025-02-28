import {
	Inject,
	Injectable,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import Redis from "ioredis";
import { RedisModuleOptions } from "./redis.module";

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
	private readonly client: Redis;

	/**
	 * Redis 서비스 생성자
	 * @param options Redis 연결 옵션
	 */
	constructor(
		@Inject("REDIS_OPTIONS")
		private readonly options: RedisModuleOptions,
	) {
		this.client = this.createClient(options);
	}

	/**
	 * Redis 클라이언트를 생성합니다.
	 * @param options Redis 연결 옵션
	 * @returns Redis 클라이언트 인스턴스
	 */
	private createClient(options: RedisModuleOptions): Redis {
		return new Redis({
			host: options.host,
			port: options.port,
			password: options.password,
			db: options.db,
			keyPrefix: options.keyPrefix,
			connectionName: options.connectionName,
			retryStrategy: options.retryStrategy,
		});
	}

	/**
	 * Redis 클라이언트 인스턴스를 반환합니다.
	 * @returns Redis 클라이언트 인스턴스
	 */
	public getClient(): Redis {
		return this.client;
	}

	/**
	 * Redis 연결 상태를 확인합니다.
	 * @returns 연결 상태
	 */
	public ping(): Promise<string> {
		return this.client.ping();
	}

	/**
	 * 키에 해당하는 값을 설정합니다.
	 * @param key 키
	 * @param value 값
	 * @param ttl 만료 시간(초)
	 * @returns 성공 여부
	 */
	public async set(key: string, value: string, ttl?: number): Promise<"OK"> {
		if (ttl) {
			return this.client.set(key, value, "EX", ttl);
		}
		return this.client.set(key, value);
	}

	/**
	 * 키에 해당하는 값을 가져옵니다.
	 * @param key 키
	 * @returns 값 또는 null
	 */
	public async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	/**
	 * 키에 해당하는 값을 삭제합니다.
	 * @param key 키
	 * @returns 삭제된 키의 수
	 */
	public async del(key: string): Promise<number> {
		return this.client.del(key);
	}

	/**
	 * 스트림에 메시지를 추가합니다.
	 * @param stream 스트림 키
	 * @param data 필드와 값의 객체
	 * @param maxLen 스트림의 최대 길이 (선택적)
	 * @returns 생성된 항목의 ID
	 */
	public async xadd(
		stream: string,
		data: Record<string, string>,
		maxLen?: number,
	): Promise<string | null> {
		const args: (string | number)[] = [];

		if (maxLen) {
			args.push("MAXLEN", "~", maxLen);
		}

		args.push("*"); // 자동 ID 생성

		// 데이터의 필드와 값을 평면화
		for (const [field, value] of Object.entries(data)) {
			args.push(field, value);
		}

		return this.client.xadd(stream, ...args);
	}

	/**
	 * 스트림에서 메시지를 읽습니다.
	 * @param streams 스트림 키와 ID의 객체
	 * @param count 읽을 최대 항목 수 (선택적)
	 * @param block 블록 시간(ms) (선택적)
	 * @returns 스트림 항목 배열
	 */
	public async xread(
		streams: Record<string, string>,
		count = 1,
		block?: number,
	): Promise<Array<[string, Array<[string, string[]]>]> | null> {
		// 직접 인수를 구성하여 전달
		const commandArgs: string[] = [];

		commandArgs.push("COUNT", count.toString());

		if (block !== undefined) {
			commandArgs.push("BLOCK", block.toString());
		}

		commandArgs.push("STREAMS");

		const keys = Object.keys(streams);
		const ids = Object.values(streams);

		// apply 메서드를 사용하여 인수 전달
		return this.client.xread.apply(
			this.client,
			[...commandArgs, ...keys, ...ids].map((arg) => String(arg)),
		);
	}

	/**
	 * 소비자 그룹을 생성합니다.
	 * @param stream 스트림 키
	 * @param group 그룹 이름
	 * @param id 시작 ID (보통 '0' 또는 '$')
	 * @returns 성공 여부
	 */
	public async xgroup(
		stream: string,
		group: string,
		id = "$",
	): Promise<string> {
		try {
			return (await this.client.xgroup(
				"CREATE",
				stream,
				group,
				id,
				"MKSTREAM",
			)) as string;
		} catch (error) {
			// 그룹이 이미 존재하는 경우 무시
			if (!error.message.includes("BUSYGROUP")) {
				throw error;
			}
			return "OK";
		}
	}

	/**
	 * 소비자 그룹으로 스트림에서 메시지를 읽습니다.
	 * @param group 그룹 이름
	 * @param consumer 소비자 이름
	 * @param streams 스트림 키와 ID의 객체
	 * @param count 읽을 최대 항목 수 (선택적)
	 * @param block 블록 시간(ms) (선택적)
	 * @returns 스트림 항목 배열
	 */
	public async xreadgroup(
		group: string,
		consumer: string,
		streams: Record<string, string>,
		count?: number,
		block?: number,
	): Promise<Array<[string, Array<[string, string[]]>]> | null> {
		const commandArgs: string[] = [];

		commandArgs.push("GROUP", group, consumer);

		if (count) {
			commandArgs.push("COUNT", count.toString());
		}

		if (block !== undefined) {
			commandArgs.push("BLOCK", block.toString());
		}

		commandArgs.push("STREAMS");

		const keys = Object.keys(streams);
		const ids = Object.values(streams);

		// apply 메서드를 사용하여 인수 전달
		return this.client.xreadgroup.apply(
			this.client,
			[...commandArgs, ...keys, ...ids].map((arg) => String(arg)),
		);
	}

	/**
	 * 스트림의 범위를 조회합니다.
	 * @param stream 스트림 키
	 * @param start 시작 ID
	 * @param end 종료 ID
	 * @param count 최대 항목 수 (선택적)
	 * @returns 스트림 항목 배열
	 */
	public async xrange(
		stream: string,
		start = "-",
		end = "+",
		count?: number,
	): Promise<Array<[string, string[]]> | null> {
		const commandArgs: string[] = [stream, start, end];

		if (count) {
			commandArgs.push("COUNT", count.toString());
		}

		return this.client.xrange.apply(
			this.client,
			commandArgs.map((arg) => String(arg)),
		);
	}

	/**
	 * 처리 완료된 메시지를 확인합니다.
	 * @param stream 스트림 키
	 * @param group 그룹 이름
	 * @param id 메시지 ID
	 * @returns 확인된 메시지 수
	 */
	public async xack(
		stream: string,
		group: string,
		id: string | string[],
	): Promise<number> {
		const ids = Array.isArray(id) ? id : [id];
		return this.client.xack(stream, group, ...ids);
	}

	/**
	 * 모듈이 종료될 때 Redis 연결을 종료합니다.
	 */
	public async onModuleDestroy(): Promise<void> {
		await this.client.quit();
	}

	/**
	 * 모듈이 초기화될 때 Redis 연결을 확인합니다.
	 */
	public async onModuleInit(): Promise<void> {
		try {
			await this.ping();
			console.log("redis 연결 성공");
		} catch (error) {
			console.error("Redis 연결 실패", error);
		}
	}
}
