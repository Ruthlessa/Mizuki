/**
 * Widget 渲染工具
 * 提供侧边栏组件渲染的通用逻辑
 */
import type { MarkdownHeading } from "astro";

import type { WidgetConfig } from "./types/widget";
import { widgetManager } from "./widget-manager";

/**
 * 组件渲染结果
 */
export interface RenderResult {
	Component: unknown;
	props: Record<string, unknown>;
}

/**
 * 获取组件的 class 和 style 属性
 * @param component 组件配置
 * @param index 组件索引
 * @returns 包含 class 和 style 的对象
 */
export function getComponentStyles(
	component: WidgetConfig,
	index: number,
): { class: string; style: string } {
	const componentClass = widgetManager.getComponentClass(component, index);
	const componentStyle = widgetManager.getComponentStyle(component, index);
	return {
		class: componentClass,
		style: componentStyle,
	};
}

/**
 * 组装组件的 props
 * @param component 组件配置
 * @param index 组件索引
 * @param headings 可选的 Markdown 标题（用于 TOC 组件）
 * @returns 组装好的 props 对象
 */
export function buildComponentProps(
	component: WidgetConfig,
	index: number,
	headings?: MarkdownHeading[],
): Record<string, unknown> {
	const { class: componentClass, style: componentStyle } = getComponentStyles(
		component,
		index,
	);

	const props: Record<string, unknown> = {
		class: componentClass,
		style: componentStyle,
		// customProps 放在最后，允许配置项覆盖默认的 class/style
		...component.customProps,
	};

	// TOC 组件需要传入 headings
	if (
		(component.type === "toc" || component.type === "card-toc") &&
		headings
	) {
		props.headings = headings;
	}

	return props;
}

/**
 * 获取设备类型
 * @param width 窗口宽度
 * @param breakpoints 断点配置
 * @returns 设备类型
 */
export function getDeviceType(
	width: number,
	breakpoints: { mobile: number; tablet: number },
): "mobile" | "tablet" | "desktop" {
	// 断点比较使用「小于」：宽度恰好等于断点时归入更宽的设备档位
	if (width < breakpoints.mobile) {
		return "mobile";
	}
	if (width < breakpoints.tablet) {
		return "tablet";
	}
	return "desktop";
}
