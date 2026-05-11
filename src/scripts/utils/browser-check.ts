/**
 * 浏览器环境检测工具
 * 用于防止在 SSR 环境中执行浏览器特定的代码
 */

export function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isServer(): boolean {
	return !isBrowser();
}

/**
 * 安全执行函数 - 只在浏览器环境中执行
 */
export function browserOnly<T>(fn: () => T, fallback?: () => T): T | undefined {
	if (isBrowser()) {
		return fn();
	}
	return fallback?.();
}

/**
 * 安全执行异步函数 - 只在浏览器环境中执行
 */
export async function browserOnlyAsync<T>(
	fn: () => Promise<T>,
	fallback?: () => Promise<T>,
): Promise<T | undefined> {
	if (isBrowser()) {
		return fn();
	}
	return fallback?.();
}
