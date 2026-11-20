/**
 * 主题与外观设置工具
 * 负责色相（--hue）、亮暗主题、壁纸模式三组偏好的读写：localStorage 持久化 + 同步到 document 根节点。
 * 所有函数都做了 window/localStorage 存在性判断，可安全地在 SSR 环境调用。
 */
import {
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
	// WALLPAPER_BANNER,
} from "@constants/constants";

import { siteConfig } from "@/config";
import type { LIGHT_DARK_MODE, WALLPAPER_MODE } from "@/types/config";

/** 读取主题色相默认值：优先取 #config-carrier 上的 data-hue，取不到时用 250 */
export function getDefaultHue(): number {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return 250;
	}
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	// 在Swup页面切换时，config-carrier可能不存在，使用默认值
	if (!configCarrier) {
		return Number.parseInt(fallback);
	}
	return Number.parseInt(configCarrier.dataset.hue || fallback);
}

/** 读取当前色相：已保存过用户选择则用保存值，否则回退到默认值 */
export function getHue(): number {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return 250;
	}
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored) : getDefaultHue();
}

/** 保存色相并立即写入 :root 的 --hue 变量 */
export function setHue(hue: number): void {
	if (
		typeof window === "undefined" ||
		typeof localStorage === "undefined" ||
		typeof document === "undefined"
	) {
		return;
	}
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

/** 把主题应用到 document：切换 dark 类与 Expressive Code 的 data-theme，并尽量使用 View Transitions 过渡 */
export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return;
	}
	// 获取当前主题状态的完整信息
	const currentIsDark = document.documentElement.classList.contains("dark");
	const currentTheme = document.documentElement.getAttribute("data-theme");

	// 计算目标主题状态
	let targetIsDark = false; // 初始化默认值
	switch (theme) {
		case LIGHT_MODE:
			targetIsDark = false;
			break;
		case DARK_MODE:
			targetIsDark = true;
			break;
		default:
			// 处理默认情况，使用当前主题状态
			targetIsDark = currentIsDark;
			break;
	}

	// 检测是否真的需要主题切换：
	// 1. dark类状态是否改变
	// 2. expressiveCode主题是否需要更新
	const needsThemeChange = currentIsDark !== targetIsDark;
	const expectedTheme = targetIsDark ? "github-dark" : "github-light";
	const needsCodeThemeUpdate = currentTheme !== expectedTheme;

	// 如果既不需要主题切换也不需要代码主题更新，直接返回
	if (!needsThemeChange && !needsCodeThemeUpdate) {
		return;
	}

	// 定义实际执行主题切换的函数
	/** 真正修改 DOM 上的主题状态（供普通模式与 View Transitions 回调复用） */
	const performThemeChange = () => {
		// 应用主题变化
		if (needsThemeChange) {
			if (targetIsDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}

		// Set the theme for Expressive Code based on current mode
		// 只在必要时更新 data-theme 属性以减少重绘
		if (needsCodeThemeUpdate) {
			const expressiveTheme = targetIsDark
				? "github-dark"
				: "github-light";
			document.documentElement.setAttribute(
				"data-theme",
				expressiveTheme,
			);
		}
	};

	// 检查浏览器是否支持 View Transitions API
	// 用户开启「减少动效」时跳过过渡，直接同步切换，避免不适
	if (
		needsThemeChange &&
		document.startViewTransition &&
		!window.matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		// 添加标记类，表示正在使用 View Transitions
		document.documentElement.classList.add(
			"is-theme-transitioning",
			"use-view-transition",
		);

		// 使用 View Transitions API 实现平滑过渡
		const transition = document.startViewTransition(() => {
			performThemeChange();
		});

		// 在过渡完成后移除标记类（使用 finished promise 确保完全同步）
		transition.finished
			.then(() => {
				// 使用 microtask 确保在下一个事件循环前完成清理
				queueMicrotask(() => {
					document.documentElement.classList.remove(
						"is-theme-transitioning",
						"use-view-transition",
					);
				});
			})
			.catch(() => {
				// 如果过渡被中断，也要清理状态
				document.documentElement.classList.remove(
					"is-theme-transitioning",
					"use-view-transition",
				);
			});
	} else {
		// 不支持 View Transitions API 或用户偏好减少动画，使用传统方式
		// 只在需要主题切换时添加过渡保护
		if (needsThemeChange) {
			document.documentElement.classList.add("is-theme-transitioning");
		}

		performThemeChange();

		// 使用 requestAnimationFrame 确保在下一帧移除过渡保护类
		if (needsThemeChange) {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove(
					"is-theme-transitioning",
				);
			});
		}
	}
}

/** 保存主题选择并立即应用 */
export function setTheme(theme: LIGHT_DARK_MODE): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return;
	}
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

/** 读取已保存的主题，未保存时返回站点默认主题 */
export function getStoredTheme(): LIGHT_DARK_MODE {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return DEFAULT_THEME;
	}
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

/** 读取已保存的壁纸模式，未保存时返回配置中的默认模式 */
export function getStoredWallpaperMode(): WALLPAPER_MODE {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return siteConfig.wallpaperMode.defaultMode;
	}
	return (
		(localStorage.getItem("wallpaperMode") as WALLPAPER_MODE) ||
		siteConfig.wallpaperMode.defaultMode
	);
}

/** 保存壁纸模式并广播 wallpaper-mode-change 事件，通知其他组件联动 */
export function setWallpaperMode(mode: WALLPAPER_MODE): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return;
	}
	localStorage.setItem("wallpaperMode", mode);
	// 触发自定义事件通知其他组件壁纸模式已改变
	window.dispatchEvent(
		new CustomEvent("wallpaper-mode-change", { detail: { mode } }),
	);
}
