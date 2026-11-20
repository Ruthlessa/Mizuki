/** 统计趋势描述：变化数值、是否为正向增长及可选说明。 */
export interface StatTrend {
	value: number;
	isPositive: boolean;
	label?: string;
}

/** 统计卡片底部链接：目标地址与链接文案。 */
export interface StatLink {
	url: string;
	text: string;
}

/** 统计卡片入参：标题、数值、图标、尺寸、趋势与附加入口。 */
export interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: string;
	color?: string;
	gradient?: {
		from: string;
		to: string;
	};
	size?: "small" | "medium" | "large";
	trend?: StatTrend;
	link?: StatLink;
}
