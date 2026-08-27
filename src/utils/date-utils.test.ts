import { describe, expect, it } from "vitest";

import { formatDateI18n, formatDateToYYYYMMDD } from "./date-utils";

describe("formatDateToYYYYMMDD", () => {
	it("formats a date to YYYY-MM-DD", () => {
		const date = new Date("2026-08-27T12:00:00.000Z");

		expect(formatDateToYYYYMMDD(date)).toBe("2026-08-27");
	});
});

describe("formatDateI18n", () => {
	it("formats a known date in Chinese", () => {
		const result = formatDateI18n("2026-08-27");

		expect(result).toContain("2026");
		expect(result).toContain("8");
		expect(result).toContain("27");
	});

	it("handles different date strings consistently", () => {
		const result = formatDateI18n("2024-01-15");

		expect(result).toContain("2024");
		expect(result).toContain("1");
		expect(result).toContain("15");
	});
});
