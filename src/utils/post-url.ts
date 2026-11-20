/**
 * 文章静态路由生成工具
 * 为.../[slug] 类路由提供 getStaticPaths 所需的路径数组，同时兼容默认 slug、自定义 permalink 和 alias 三种寻址方式。
 * 生成前会先初始化 permalink 的序号缓存，确保 %post_id% 等占位符可用。
 */
import type { CollectionEntry } from "astro:content";

import { permalinkConfig } from "../config";
import { hasCustomPermalink, initPostIdMap } from "./permalink-utils";
import { removeFileExtension } from "./url-utils";

/** 构建文章路由参数：默认返回一条路径，配置了 alias 时额外追加一条别名路径 */
export function buildPostPaths(blogEntries: CollectionEntry<"posts">[]) {
	initPostIdMap(blogEntries);

	return blogEntries
		.map((entry) => {
			const defaultSlug = removeFileExtension(entry.id);

			if (hasCustomPermalink(entry)) {
				return [{ params: { slug: defaultSlug }, props: { entry } }];
			}

			if (permalinkConfig.enable) {
				return [{ params: { slug: defaultSlug }, props: { entry } }];
			}

			const paths: {
				params: { slug: string };
				props: { entry: CollectionEntry<"posts"> };
			}[] = [{ params: { slug: defaultSlug }, props: { entry } }];

			if (entry.data.alias) {
				// 去掉首尾斜杠，并剥离历史配置里可能残留的 posts/ 前缀
				let alias = entry.data.alias
					.replace(/^\/+/, "")
					.replace(/\/+$/, "");
				if (alias.startsWith("posts/")) {
					alias = alias.replace(/^posts\//, "");
				}
				paths.push({ params: { slug: alias }, props: { entry } });
			}

			return paths;
		})
		.flat();
}
