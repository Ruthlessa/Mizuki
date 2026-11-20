/**
 * 导航相关组件的 Props 类型定义，含移动端面板、下拉菜单与处理后的链接结构。
 */
import type { LinkPreset, NavBarLink } from "../../../types/config";

export interface NavMenuPanelProps {
	links: NavBarLink[];
}

export interface DropdownMenuProps {
	link: NavBarLink;
	class?: string;
}

export interface ProcessedNavBarLink extends Omit<NavBarLink, "children"> {
	children?: ProcessedNavBarLink[];
}

export type { LinkPreset };
