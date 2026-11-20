/**
 * 按钮相关组件的 Props 类型定义：同时包含按钮本体与历史遗留的链接/标签变体类型。
 */
export interface ButtonProps {
	type?: "button" | "submit" | "reset";
	variant?: "primary" | "secondary" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	class?: string;
}

export interface ButtonLinkProps {
	badge?: string;
	url?: string;
	label?: string;
	class?: string;
}

export interface ButtonTagProps {
	size?: string;
	dot?: boolean;
	href?: string;
	label?: string;
	class?: string;
}
