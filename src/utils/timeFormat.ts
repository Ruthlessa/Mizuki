/**
 * 相对时间格式化工具
 * 用于日记/动态等场景把绝对时间转换为「x 分钟前」这类文案，单位文案由调用方传入。
 * 依赖 siteConfig.timeZone 做时区换算，默认回退到 UTC+8。
 */
import { siteConfig } from "../config";

/**
 * Format relative time for diary moments
 * @param dateString ISO date string
 * @param minutesAgo text for minutes
 * @param hoursAgo text for hours
 * @param daysAgo text for days
 */
export function formatRelativeTime(
	dateString: string,
	minutesAgo: string,
	hoursAgo: string,
	daysAgo: string,
): string {
	let timeGap = 8; // Default UTC+8
	// 只有配置值落在合法时区区间内才采用，否则沿用默认的 UTC+8
	if (siteConfig.timeZone >= -12 && siteConfig.timeZone <= 12) {
		timeGap = siteConfig.timeZone;
	}

	const now = new Date();
	// 先把本地时间还原成 UTC 时间戳，再按站点时区偏移得到站点本地时间
	const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
	const localNow = utc + timeGap * 60 * 60 * 1000;
	const date = new Date(dateString);
	const diffInMinutes = Math.floor((localNow - date.getTime()) / (1000 * 60));

	if (diffInMinutes < 60) {
		return `${diffInMinutes}${minutesAgo}`;
	}
	if (diffInMinutes < 1440) {
		const hours = Math.floor(diffInMinutes / 60);
		return `${hours}${hoursAgo}`;
	}
	const days = Math.floor(diffInMinutes / 1440);
	return `${days}${daysAgo}`;
}
