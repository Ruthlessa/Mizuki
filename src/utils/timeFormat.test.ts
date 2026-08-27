import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatRelativeTime } from "./timeFormat";

// siteConfig.timeZone is configured as UTC+8.
const FIXED_NOW_ISO = "2026-08-27T00:00:00.000Z";

describe("formatRelativeTime", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW_ISO);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns minutes ago for recent dates", () => {
		// localNow equals FIXED_NOW + 8h; pick a time 5 minutes before that.
		const recent = "2026-08-27T07:55:00.000Z";

		const result = formatRelativeTime(recent, "m", "h", "d");

		expect(result).toBe("5m");
	});

	it("returns hours ago for dates within a day", () => {
		const hoursAgo = "2026-08-27T05:00:00.000Z";

		const result = formatRelativeTime(hoursAgo, "m", "h", "d");

		expect(result).toBe("3h");
	});

	it("returns days ago for older dates", () => {
		const daysAgo = "2026-08-25T08:00:00.000Z";

		const result = formatRelativeTime(daysAgo, "m", "h", "d");

		expect(result).toBe("2d");
	});

	it("uses configured labels", () => {
		const recent = "2026-08-27T07:50:00.000Z";

		const result = formatRelativeTime(recent, " minutes ago", " hours ago", " days ago");

		expect(result).toBe("10 minutes ago");
	});
});
