// 通用交互与格式化工具：注册首次交互监听、时间格式化与静态资源路径补全。
// 非浏览器环境下注册函数返回空清理函数，保证 SSR 安全。
const INTERACTION_EVENTS = ["click", "keydown", "touchstart"];

const isBrowser = typeof document !== "undefined";

/** 在文档捕获阶段注册一次性交互监听，返回注销函数；SSR 下直接返回空实现。 */
export function registerInteractionHandler(handler: () => void): () => void {
	if (!isBrowser) {
		return () => {};
	}

	INTERACTION_EVENTS.forEach((event) => {
		document.addEventListener(event, handler, { capture: true });
	});

	return () => {
		INTERACTION_EVENTS.forEach((event) => {
			document.removeEventListener(event, handler, { capture: true });
		});
	};
}

/** 把秒数格式化为 m:ss；非法或负数统一显示 0:00。 */
export function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return "0:00";
	}
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** 补全资源路径：绝对 URL 与已带前导斜杠的路径原样返回，其余加上根路径前缀。 */
export function getAssetPath(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}
