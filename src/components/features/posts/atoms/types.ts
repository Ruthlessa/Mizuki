/** 字数展示入参：字数、展示形态（元信息/卡片）与额外类名。 */
export interface WordCountProps {
	words: number;
	variant?: "meta" | "card";
	class?: string;
}

/** 阅读时长展示入参：分钟数、展示形态与额外类名。 */
export interface ReadingTimeProps {
	minutes: number;
	variant?: "meta" | "card";
	class?: string;
}
