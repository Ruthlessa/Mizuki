/**
 * 默认站点图标配置：当用户未在站点配置中指定 favicon 时使用。
 * 分别为浅色与深色主题提供一份同路径的 ico，保证浏览器标签页图标可用。
 */
import type { Favicon } from "@/types/config.ts";

export const defaultFavicons: Favicon[] = [
	{
		src: "/favicon/favicon.ico",
		theme: "light",
		sizes: "64x64",
	},
	{
		src: "/favicon/favicon.ico",
		theme: "dark",
		sizes: "64x64",
	},
];
