/**
 * 自定义滚动条组件的 Props 类型定义，描述滚动方向与自定义样式类名。
 */
export interface CustomScrollbarProps {
	children: any;
	orientation?: "horizontal" | "vertical";
	class?: string;
}
