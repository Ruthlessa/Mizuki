/**
 * 加载指示器组件的 Props 类型定义，描述尺寸与动画样式。
 */
export interface LoaderProps {
	size?: "sm" | "md" | "lg";
	variant?: "spinner" | "dots" | "pulse";
	class?: string;
}
