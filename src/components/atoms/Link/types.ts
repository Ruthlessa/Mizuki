/**
 * 链接组件的 Props 类型定义，描述目标地址、打开方式、样式变体与下划线开关。
 */
export interface LinkProps {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	rel?: string;
	variant?: "default" | "muted" | "primary";
	underline?: boolean;
	class?: string;
}
