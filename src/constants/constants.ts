/**
 * 全站静态常量：分页大小、主题模式、Banner 尺寸、页面宽度、分类与壁纸模式。
 * 这些值会被布局、列表页与壁纸组件共同引用，修改时需要全局考虑。
 */
export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark";
export const DEFAULT_THEME = LIGHT_MODE;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 90;

// Category constants
export const UNCATEGORIZED = "uncategorized";

// Wallpaper mode constants
export const WALLPAPER_BANNER = "banner";
export const WALLPAPER_FULLSCREEN = "fullscreen";
export const WALLPAPER_NONE = "none";
