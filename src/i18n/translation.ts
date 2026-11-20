/**
 * 国际化入口：按站点语言查找语言包，并提供 i18n(key) 便捷函数。
 * 未匹配到语言时回退到简体中文。
 */
import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { zh_CN } from "./languages/zh_CN";

export type Translation = Record<I18nKey, string>;

const defaultTranslation = zh_CN;

const map: Record<string, Translation> = {
	zh_cn: zh_CN,
	zh: zh_CN,
};

/** 按语言代码获取翻译表，未命中时返回默认语言包 */
export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

/** 根据当前站点语言取出指定键的文案，供组件直接调用 */
export function i18n(key: I18nKey): string {
	const lang = siteConfig.lang || "zh_CN";
	return getTranslation(lang)[key];
}
