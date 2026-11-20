/**
 * 日期格式化工具
 * 提供「YYYY-MM-DD」的固定格式与按站点语言的本地化长日期格式，供文章列表、归档页等展示日期使用。
 */
import { siteConfig } from "../config";

/** 将 Date 截断为 UTC 日期字符串（YYYY-MM-DD），用于统一比较与展示 */
export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

// 国际化日期格式化函数
/** 按站点语言把日期字符串格式化为「年 月 日」的本地化文本，未知语言回退到 en-US */
export function formatDateI18n(dateString: string): string {
	const date = new Date(dateString);
	const lang = siteConfig.lang || "en";

	// 根据语言设置不同的日期格式
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	// 语言代码映射
	const localeMap: Record<string, string> = {
		zh_CN: "zh-CN",
		zh_TW: "zh-TW",
		en: "en-US",
		ja: "ja-JP",
		ko: "ko-KR",
		es: "es-ES",
		th: "th-TH",
		vi: "vi-VN",
		tr: "tr-TR",
		id: "id-ID",
		fr: "fr-FR",
		de: "de-DE",
		ru: "ru-RU",
		ar: "ar-SA",
	};

	const locale = localeMap[lang] || "en-US";
	return date.toLocaleDateString(locale, options);
}
