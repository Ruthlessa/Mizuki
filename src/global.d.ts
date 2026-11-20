/**
 * 全局类型声明：扩展 Window（swup、pagefind、看板娘、侧边栏管理等运行时属性）
 * 以及自定义元素、Fancybox 与 Pagefind 搜索结果的结构。
 */
export {};

declare global {
	interface HTMLElementTagNameMap {
		"table-of-contents": HTMLElement & {
			init?: () => void;
			regenerateTOC?: () => void;
		};
	}

	/**
	 * Swup hooks interface for type-safe swup access
	 */
	interface Swup {
		hooks: {
			on: (event: string, handler: (...args: unknown[]) => void) => void;
			off: (event: string, handler: (...args: unknown[]) => void) => void;
		};
		navigate?: (url: string, options?: { history?: boolean }) => void;
		preload?: (url: string) => Promise<void>;
	}

	/**
	 * Site config TOC section interface
	 */
	interface SiteConfigTOC {
		enable?: boolean;
		mode?: "float" | "sidebar";
		depth?: number;
		useJapaneseBadge?: boolean;
	}

	/**
	 * Site config interface for type-safe global siteConfig access
	 */
	interface SiteConfigWindow {
		lang?: string;
		toc?: SiteConfigTOC;
		wallpaperMode?: {
			defaultMode?: "banner" | "fullscreen" | "none";
		};
	}

	/**
	 * 扩展浏览器 Window：挂载各脚本在运行时注入的全局对象与初始化标志
	 */
	interface Window {
		swup: Swup | undefined;
		closeAnnouncement: () => void;
		pagefind: {
			search: (query: string) => Promise<{
				results: {
					data: () => Promise<SearchResult>;
				}[];
			}>;
		};

		loadPagefind?: () => Promise<void>;
		toggleFloatingTOC?: () => void;
		mobileTOCInit?: () => void;
		initSemifullScrollDetection?: () => void;
		iconifyLoaded?: boolean;

		// CardTOC manager
		CardTOC?: {
			manager: {
				init?: () => void;
				cleanup?: () => void;
			} | null;
		};

		// TOC internal navigation flag
		tocInternalNavigation?: boolean;
		__iconifyLoader?: {
			load: () => Promise<void>;
			addToPreloadQueue: (icons: string[]) => void;
			onLoad: (callback: () => void) => void;
			isLoaded: boolean;
		};
		siteConfig: SiteConfigWindow;
		hljs?: {
			highlightElement: (block: HTMLElement) => void;
		};
		renderMermaidDiagrams?: () => void;

		// Sidebar manager window properties
		__mizukiSidebarResizeHandler?: () => void;
		__mizukiSidebarSwupHooked?: boolean;
		__mizukiSidebarManagerInitialized?: boolean;
		__mizukiRightSidebarResizeHandler?: () => void;
		__mizukiRightSidebarSwupHooked?: boolean;
		__mizukiRightSidebarManagerInitialized?: boolean;
	}

	/**
	 * Fancybox 图片灯箱的最小接口声明，用于脚本中动态绑定/解绑
	 */
	interface Fancybox {
		unbind: (selector: string) => void;
		bind: (selector: string, options: object) => void;
	}

	var Fancybox: Fancybox | undefined;
}

/** Pagefind 搜索结果条目，用于搜索组件的类型提示 */
interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: {
		element: string;
		id: string;
		text: string;
		location: number;
	}[];
	weighted_locations?: {
		weight: number;
		balanced_score: number;
		location: number;
	}[];
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}

export { SearchResult };
