/**
 * Swup 初始化脚本
 * 这个文件放在 public 目录中，避免 SSR 问题
 */

// 等待 DOM 加载完成
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initSwup);
} else {
	initSwup();
}

async function initSwup() {
	// 动态导入 Swup 管理器
	try {
		const { initSwupManager } = await import("/src/scripts/swup-manager.js");
		await initSwupManager();
	} catch (error) {
		console.error("Failed to initialize Swup:", error);
	}

	// 动态导入代码折叠功能
	try {
		await import("/src/scripts/code-collapse.js");
	} catch (error) {
		console.error("Failed to load code-collapse:", error);
	}

	// 动态导入主题优化器
	try {
		await import("/src/scripts/theme-optimizer.js");
	} catch (error) {
		console.error("Failed to load theme-optimizer:", error);
	}
}
