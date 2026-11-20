/** 时间线条目的外链类型：网站、证书、项目或其他。 */
export interface TimelineLink {
	name: string;
	url: string;
	type: "website" | "certificate" | "project" | "other";
}

/** 单条时间线数据：类型、起止时间、组织、技能、成果与外链等。 */
export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "education" | "work" | "project" | "achievement";
	startDate: string;
	endDate?: string;
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: TimelineLink[];
	icon?: string;
	color?: string;
	featured?: boolean;
}

/** 时间线卡片入参：条目数据与可选的技能展示上限。 */
export interface TimelineCardProps {
	item: TimelineItem;
	maxSkills?: number;
}
