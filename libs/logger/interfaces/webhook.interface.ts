export interface WebhookConfig {
	infoUrl: string;
	errorUrl?: string;
}

export interface WebhookService {
	sendWebhook(
		level: string,
		message: string,
		context?: string,
		stack?: string,
	): Promise<void>;
}
