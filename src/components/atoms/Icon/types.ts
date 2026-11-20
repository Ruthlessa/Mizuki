/**
 * 图标组件的 Props 类型定义，描述图标名、尺寸档位、颜色与加载策略。
 */
export interface IconProps {
	icon: string;
	class?: string;
	style?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	color?: string;
	fallback?: string;
	loading?: "lazy" | "eager";
}
