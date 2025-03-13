/**
 * 애플리케이션 전체에서 일관된 날짜 변환 기능을 제공하는 유틸리티 클래스
 * 문자열 <-> Date 객체 간의 기본적인 변환을 담당합니다.
 */
export class DateUtil {
	/**
	 * Date 객체를 ISO 문자열로 변환합니다.
	 * @param date 변환할 날짜
	 * @returns ISO 형식의 날짜 문자열 (YYYY-MM-DD) 또는 유효하지 않은 경우 빈 문자열
	 */
	public static formatDate(date: Date): string {
		if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
			return "";
		}

		// ISO 형식에서 날짜 부분만 추출 (YYYY-MM-DD)
		return date.toISOString().split("T")[0];
	}

	/**
	 * Date 객체를 ISO 날짜+시간 문자열로 변환합니다.
	 * @param date 변환할 날짜
	 * @returns ISO 형식의 날짜+시간 문자열 또는 유효하지 않은 경우 빈 문자열
	 */
	public static formatDateTime(date: Date): string {
		if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
			return "";
		}

		return date.toISOString();
	}

	/**
	 * 문자열을 Date 객체로 변환합니다.
	 * @param dateStr 변환할 날짜 문자열 (ISO 형식 권장: YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss.sssZ)
	 * @returns 변환된 Date 객체 또는 유효하지 않은 경우 null
	 */
	public static parseDate(dateStr: string): Date | null {
		if (!dateStr) {
			return null;
		}

		try {
			const date = new Date(dateStr);
			return Number.isNaN(date.getTime()) ? null : date;
		} catch (error) {
			return null;
		}
	}
}
