export function envCheck() {
	if (!process.env.UNIT) {
		throw new Error("UNIT is not set");
	}

	if (!process.env.COINS) {
		throw new Error("COINS is not set");
	}

	if (!process.env.INTERVAL_MINUTE) {
		throw new Error("INTERVAL_MINUTE is not set");
	}

	if (!process.env.MARKET) {
		throw new Error("MARKET is not set");
	}

	console.log("[Cron Signal] Environment check passed");
}
