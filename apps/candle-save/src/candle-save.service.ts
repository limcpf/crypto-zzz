import { Injectable } from "@nestjs/common";

@Injectable()
export class CandleSaveService {
	save(message: string): string {
		console.log(message);
		return "Hello World!";
	}
}
