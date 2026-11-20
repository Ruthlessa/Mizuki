/**
 * 胶囊条目组件的 Props 类型定义，描述跳转地址、可访问标签、圆点与右侧徽标。
 */
export interface ChipProps {
	href?: string;
	label?: string;
	dot?: boolean;
	badge?: string | number;
	class?: string;
}
