import { Injectable } from "@nestjs/common";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HttpOptions {
	headers?: Record<string, string>;
	params?: Record<string, string>;
	body?: unknown;
}

@Injectable()
export class HttpClientService {
	/**
	 * HTTP 요청을 수행합니다.
	 * @param method HTTP 메서드
	 * @param url 요청 URL
	 * @param options 요청 옵션
	 * @returns 응답 데이터
	 */
	async request<T>(
		method: HttpMethod,
		url: string,
		options: HttpOptions = {},
	): Promise<T> {
		const { headers = {}, params, body } = options;

		// URL 파라미터 처리
		const queryParams = params
			? `?${new URLSearchParams(params).toString()}`
			: "";

		const requestUrl = `${url}${queryParams}`;

		const response = await fetch(requestUrl, {
			method,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		// 에러 핸들링
		if (!response.ok) {
			await this.handleError(response);
		}

		// 응답이 비어있는지 확인
		const contentLength = response.headers.get("Content-Length");
		if (contentLength === "0") {
			return {} as T;
		}

		// 응답 데이터 파싱
		const data = await response.json();
		return data as T;
	}

	/**
	 * GET 요청을 수행합니다.
	 */
	async get<T>(
		url: string,
		options: Omit<HttpOptions, "body"> = {},
	): Promise<T> {
		return this.request<T>("GET", url, options);
	}

	/**
	 * POST 요청을 수행합니다.
	 */
	async post<T>(url: string, options: HttpOptions = {}): Promise<T> {
		return this.request<T>("POST", url, options);
	}

	/**
	 * PUT 요청을 수행합니다.
	 */
	async put<T>(url: string, options: HttpOptions = {}): Promise<T> {
		return this.request<T>("PUT", url, options);
	}

	/**
	 * DELETE 요청을 수행합니다.
	 */
	async delete<T>(url: string, options: HttpOptions = {}): Promise<T> {
		return this.request<T>("DELETE", url, options);
	}

	/**
	 * 에러 처리를 수행합니다.
	 */
	private async handleError(response: Response): Promise<never> {
		let errorMessage = `HTTP 에러 ${response.status}: ${response.statusText}`;

		try {
			const errorData = await response.json();
			if (errorData.message) {
				errorMessage = `${errorMessage} - ${errorData.message}`;
			}
		} catch (e) {
			// JSON 파싱 실패 시 무시
		}

		throw new Error(errorMessage);
	}
}
