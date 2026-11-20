/** 归档面板入参：标签/分类候选与按时间排序的文章列表。 */
export interface ArchivePanelProps {
	tags: string[];
	categories: string[];
	sortedPosts: Post[];
}

/** 归档中使用的精简文章结构，仅保留展示与筛选所需字段。 */
export interface Post {
	id: string;
	url?: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
		alias?: string;
		permalink?: string;
	};
}
