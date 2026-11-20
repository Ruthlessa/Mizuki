/** 文章卡片相关组件的入参类型定义 */
import type { Page } from "astro";
import type { CollectionEntry } from "astro:content";

/** 文章卡片入参：内容集合条目、可选样式与额外类名。 */
export interface PostCardProps {
	class?: string;
	entry: CollectionEntry<"posts">;
	style?: string;
}

/** 文章元信息入参：发布/更新日期、分类标签及各类展示开关。 */
export interface PostMetaProps {
	published: Date;
	updated?: Date;
	category?: string;
	tags?: string[];
	hideUpdateDate?: boolean;
	hideTagsForMobile?: boolean;
	isHome?: boolean;
	className?: string;
	id?: string;
	showOnlyBasicMeta?: boolean;
	words?: number;
	minutes?: number;
	showWordCount?: boolean;
}

/** 文章列表页入参：Astro 分页对象，元素为 posts 集合条目。 */
export interface PostPageProps {
	page: Page<CollectionEntry<"posts">>;
}
