/**
 * URL 生成工具
 * 统一拼接文章、标签、分类等站内链接，并处理 BASE_URL 前缀、permalink 优先级与路径归一化。
 * 链接优先级：文章自填 permalink > 全局 permalink 生成 > 文章 alias > 默认 /posts/{slug}。
 */
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import type { CollectionEntry } from "astro:content";

import { permalinkConfig } from "../config";
import { generatePermalinkSlug } from "./permalink-utils";

/**
 * 移除文件扩展名（.md, .mdx, .markdown）
 * 用于将 Astro v5 Content Layer API 的 id 转换为 URL 友好的 slug
 */
export function removeFileExtension(id: string): string {
	return id.replace(/\.(md|mdx|markdown)$/i, "");
}

/** 比较两个路径是否等价（忽略首尾斜杠与大小写） */
export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

/** 用「/」拼接路径片段，并把连续斜杠折叠成单个，避免出现 // */
function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

/** 根据 slug 生成 /posts/ 下的文章链接（自动去掉 markdown 扩展名） */
export function getPostUrlBySlug(slug: string): string {
	// 移除文件扩展名（如 .md, .mdx 等）
	const slugWithoutExt = removeFileExtension(slug);
	return url(`/posts/${slugWithoutExt}/`);
}

/** 根据 alias 生成 /posts/ 下的文章链接 */
export function getPostUrlByAlias(alias: string): string {
	// 移除开头的斜杠并确保固定链接在 /posts/ 路径下
	const cleanAlias = alias.replace(/^\/+/, "");
	return url(`/posts/${cleanAlias}/`);
}

/** 统一入口：按 permalink/alias/默认 slug 的优先级计算文章最终 URL */
export function getPostUrl(post: CollectionEntry<"posts">): string;
export function getPostUrl(post: {
	id: string;
	data: { alias?: string; permalink?: string };
}): string;
export function getPostUrl(post: any): string {
	// 如果文章有自定义 permalink，优先使用（在根目录下）
	if (post.data.permalink) {
		const slug = post.data.permalink
			.replace(/^\/+/, "")
			.replace(/\/+$/, "");
		return url(`/${slug}/`);
	}

	// 如果全局 permalink 功能启用，使用生成的 slug（在根目录下）
	if (permalinkConfig.enable) {
		const slug = generatePermalinkSlug(post);
		return url(`/${slug}/`);
	}

	// 如果文章有 alias，使用 alias（在 /posts/ 下）
	if (post.data.alias) {
		return getPostUrlByAlias(post.data.alias);
	}

	// 否则使用默认的 slug 路径
	return getPostUrlBySlug(post.id);
}

/** 生成标签筛选链接；空标签回退到归档首页 */
export function getTagUrl(tag: string): string {
	if (!tag) {
		return url("/archive/");
	}
	return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`);
}

/** 生成分类筛选链接；空值或「未分类」统一走 uncategorized 参数 */
export function getCategoryUrl(category: string | null): string {
	if (
		!category ||
		category.trim() === "" ||
		category.trim().toLowerCase() ===
			i18n(I18nKey.uncategorized).toLowerCase()
	) {
		return url("/archive/?uncategorized=true");
	}
	return url(`/archive/?category=${encodeURIComponent(category.trim())}`);
}

/** 取路径所在的目录部分（包含末尾斜杠）；没有目录时返回根目录 */
export function getDir(path: string): string {
	// 移除文件扩展名
	const pathWithoutExt = removeFileExtension(path);
	const lastSlashIndex = pathWithoutExt.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return pathWithoutExt.substring(0, lastSlashIndex + 1);
}

/** 从 src/ 下的文件路径截取出所在目录，用于按目录聚合内容 */
export function getFileDirFromPath(filePath: string): string {
	return filePath.replace(/^src\//, "").replace(/\/[^/]+$/, "");
}

/** 给站内路径加上 BASE_URL 前缀，适配部署在子路径的场景 */
export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
