/**
 * Decryption utilities for password-protected content
 *
 * Note: These functions are designed to run in the browser where CryptoJS
 * is available as a global variable after loading /assets/js/crypto-js.min.js
 */

import type { DecryptResult } from "../types/auth";

declare const CryptoJS: {
	AES: {
		decrypt: (
			encryptedContent: string,
			password: string,
		) => {
			toString: (encoding: typeof CryptoJS.enc.Utf8) => string;
		};
	};
	enc: { Utf8: unknown };
};

const CRYPTOJS_URL = "/assets/js/crypto-js.min.js";
const VERIFICATION_PREFIX = "MIZUKI-VERIFY:";

/** 按需动态注入 CryptoJS 脚本，供解密流程在浏览器端使用。 */
export async function loadCryptoLibraries(): Promise<void> {
	if (typeof CryptoJS === "undefined") {
		await new Promise<void>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = CRYPTOJS_URL;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error("Failed to load CryptoJS"));
			document.head.appendChild(script);
		});
	}
}

/** 检查 CryptoJS 是否已挂载到全局，避免重复加载脚本。 */
export function verifyCryptoLoaded(): boolean {
	return typeof CryptoJS !== "undefined";
}

/** 用 AES 解密文章内容，通过固定前缀校验密码是否正确并以结构化结果返回。 */
export async function decryptContent(
	encryptedContent: string,
	password: string,
): Promise<DecryptResult> {
	if (!verifyCryptoLoaded()) {
		await loadCryptoLibraries();
	}

	if (!password) {
		return { success: false, content: null, error: "passwordRequired" };
	}

	try {
		const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, password);
		const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

		if (
			!decryptedString ||
			!decryptedString.startsWith(VERIFICATION_PREFIX)
		) {
			return { success: false, content: null, error: "incorrect" };
		}

		const realContent = decryptedString.replace(VERIFICATION_PREFIX, "");
		return { success: true, content: realContent, error: null };
	} catch (error) {
		console.error("Decryption error:", error);
		return { success: false, content: null, error: "decryptionError" };
	}
}

/** 重新执行解密后内容中的 script 标签，使图表等脚本初始化逻辑生效。 */
export async function executeDecryptedScripts(
	contentDiv: HTMLElement,
): Promise<void> {
	const scripts = contentDiv.querySelectorAll("script");
	const scriptPromises = Array.from(scripts).map((script) => {
		return new Promise<void>((resolve) => {
			const newScript = document.createElement("script");
			if (script.type) {
				newScript.type = script.type;
			}
			newScript.textContent = script.textContent;
			newScript.onload = () => resolve();
			newScript.onerror = () => resolve();
			script.parentNode?.replaceChild(newScript, script);
			if (!newScript.src) {
				resolve();
			}
		});
	});
	await Promise.all(scriptPromises);
}

/** 解密成功后取消分享与版权区块的隐藏样式，恢复完整文章界面。 */
export function showShareComponents(): void {
	const shareComponent = document.getElementById("share-component");
	const licenseComponent = document.getElementById("license-component");
	if (shareComponent) {
		shareComponent.classList.remove("encrypted-hidden");
	}
	if (licenseComponent) {
		licenseComponent.classList.remove("encrypted-hidden");
	}
}

const SESSION_UNLOCKED_MARKER = "UNLOCKED";

/** 仅在 sessionStorage 记录“已解锁”标记（不保存明文密码），用于本次会话免重复输入。 */
export function savePassword(password: string): void {
	const key = "page-password-" + window.location.pathname;
	// Do not store cleartext secrets in Web Storage.
	// Preserve session "unlocked" state with a non-sensitive marker only.
	void password;
	sessionStorage.setItem(key, SESSION_UNLOCKED_MARKER);
}

/** 读取当前页面的解锁标记，存在则返回标记值，否则返回 null。 */
export function getSavedPassword(): string | null {
	const key = "page-password-" + window.location.pathname;
	const storedValue = sessionStorage.getItem(key);
	return storedValue === SESSION_UNLOCKED_MARKER
		? SESSION_UNLOCKED_MARKER
		: null;
}

/** 清除当前页面的解锁标记，用于退出或密码失效场景。 */
export function removeSavedPassword(): void {
	const key = "page-password-" + window.location.pathname;
	sessionStorage.removeItem(key);
}

/** 解密完成后延迟触发代码高亮、目录重建等依赖 DOM 的增强逻辑。 */
export function triggerPostDecryptUpdates(): void {
	setTimeout(() => {
		highlightCode();
		regenerateTOC();
		initMobileTOC();
		bindFancybox();
		handleHashNavigation();
		triggerImageLoadEvents();
		triggerMermaidRender();
	}, 50);
}

/** 对解密内容中的代码块重新执行 highlight.js 高亮。 */
function highlightCode(): void {
	if (window.hljs) {
		const contentDiv = document.getElementById("decrypted-content");
		if (contentDiv) {
			contentDiv.querySelectorAll("pre code").forEach((block) => {
				window.hljs!.highlightElement(block as HTMLElement);
			});
		}
	}
}

/** 通知目录组件重新生成，使其包含解密后新增的标题。 */
function regenerateTOC(): void {
	const tocElement = document.querySelector("table-of-contents") as
		| (HTMLElement & { init?: () => void; regenerateTOC?: () => void })
		| null;
	if (tocElement) {
		if (typeof tocElement.regenerateTOC === "function") {
			tocElement.regenerateTOC();
		}
		if (typeof tocElement.init === "function") {
			tocElement.init();
		}
	}
}

/** 重新初始化移动端目录，确保新内容出现在移动端导航中。 */
function initMobileTOC(): void {
	if (typeof window.mobileTOCInit === "function") {
		window.mobileTOCInit();
	}
}

/** 为解密出的图片重新绑定 Fancybox 灯箱，先解绑避免重复绑定。 */
function bindFancybox(): void {
	if (typeof Fancybox !== "undefined" && Fancybox.bind) {
		Fancybox.unbind("[data-fancybox]");
		Fancybox.bind("[data-fancybox]", {});
	}
}

/** 解密后跳转到 URL hash 指向的标题位置，保持锚点导航可用。 */
function handleHashNavigation(): void {
	if (window.location.hash) {
		const targetId = window.location.hash.substring(1);
		const targetElement = document.getElementById(targetId);
		if (targetElement) {
			targetElement.scrollIntoView({ behavior: "smooth" });
		}
	}
}

/** 解密内容中的图片加载完成后派发滚动/尺寸事件，促使懒加载与布局重算。 */
function triggerImageLoadEvents(): void {
	const contentDiv = document.getElementById("decrypted-content");
	if (!contentDiv) {
		return;
	}

	const images = contentDiv.querySelectorAll("img");
	images.forEach((img) => {
		if (!img.complete) {
			img.addEventListener("load", () => {
				window.dispatchEvent(new Event("scroll"));
				window.dispatchEvent(new Event("resize"));
			});
		}
	});

	[0, 100, 300, 500, 1000, 2000].forEach((delay) => {
		setTimeout(() => {
			window.dispatchEvent(new Event("scroll"));
			window.dispatchEvent(new Event("resize"));
		}, delay);
	});
}

/** 若页面存在 Mermaid 渲染钩子，则在微延迟后触发重新渲染图表。 */
async function triggerMermaidRender(): Promise<void> {
	if (typeof window.renderMermaidDiagrams === "function") {
		await new Promise((resolve) => setTimeout(resolve, 100));
		window.renderMermaidDiagrams();
	}
}
