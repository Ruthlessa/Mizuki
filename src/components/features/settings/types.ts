/** 设置面板相关的类型定义与壁纸模式类型透传 */
import type { WALLPAPER_MODE } from "@/types/config";

export type { WALLPAPER_MODE };

/** 显示设置组件入参：额外样式类。 */
export interface DisplaySettingsProps {
	class?: string;
}

/** 壁纸切换组件入参：可选初始壁纸模式。 */
export interface WallpaperSwitchProps {
	mode?: WALLPAPER_MODE;
}
