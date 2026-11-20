/**
 * 追番页布局切换处理器
 * 在列表/网格布局间切换时更新容器类名、联动右侧边栏显隐，并用 FLIP 动画让卡片平滑过渡。
 * 初始化带有指数退避重试，兼容脚本先于 DOM 就绪执行的情况。
 */
export interface LayoutHandlerOptions {
	containerId: string;
	hasRightSidebars: boolean;
}

/** 初始化布局切换逻辑：应用当前布局并监听 layoutChange 事件 */
export function initAnimeLayoutHandler(options: LayoutHandlerOptions) {
	const { containerId, hasRightSidebars } = options;

	/** 切换到指定布局：先记录旧位置，改完类名后再用 FLIP 动画过渡 */
	function updateAnimeListLayout(layout: string, shouldAnimate = true) {
		const animeListContainer = document.getElementById(containerId);
		if (!animeListContainer) {
			return;
		}
		animeListContainer.dataset.currentLayout = layout;

		const animeItems = Array.from(
			document.querySelectorAll("[data-anime-status]"),
		) as HTMLElement[];
		const visibleItems = animeItems.filter(
			(item) => item.offsetParent !== null,
		);
		const firstPositions = new Map();
		if (shouldAnimate) {
			visibleItems.forEach((item) => {
				const rect = item.getBoundingClientRect();
				firstPositions.set(item, {
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height,
				});
			});
		}

		// 切换瞬间临时禁用卡片自身的过渡，防止与 FLIP 动画叠加产生抖动
		const style = document.createElement("style");
		style.innerHTML = `.anime-grid-container .group { transition: none !important; }`;
		document.head.appendChild(style);
		animeListContainer.classList.remove(
			"anime-list-mode",
			"anime-grid-mode",
		);
		animeListContainer.classList.remove(
			"grid-cols-1",
			"md:grid-cols-2",
			"lg:grid-cols-3",
		);
		if (layout === "grid") {
			animeListContainer.classList.add("anime-grid-mode");
			if (hasRightSidebars) {
				const rightSidebar = document.querySelector(
					".right-sidebar-container",
				) as HTMLElement | null;
				if (rightSidebar) {
					rightSidebar.style.display = "none";
					rightSidebar.classList.add("hidden-in-grid-mode");
				}
			}
			const mainGrid = document.getElementById(
				"main-grid",
			) as HTMLElement | null;
			if (mainGrid) {
				mainGrid.style.gridTemplateColumns = "17.5rem 1fr";
				mainGrid.classList.add("two-column-layout");
			}
		} else {
			animeListContainer.classList.add("anime-list-mode");
			animeListContainer.classList.add("grid-cols-1", "lg:grid-cols-2");
			if (hasRightSidebars) {
				const rightSidebar = document.querySelector(
					".right-sidebar-container",
				) as HTMLElement | null;
				if (rightSidebar) {
					rightSidebar.style.display = "";
					rightSidebar.classList.remove("hidden-in-grid-mode");
				}
			}
			const mainGrid = document.getElementById(
				"main-grid",
			) as HTMLElement | null;
			if (mainGrid) {
				mainGrid.style.gridTemplateColumns = "";
				mainGrid.classList.remove("two-column-layout");
			}
		}

		// 强制读取 offsetHeight 触发一次同步重排，确保浏览器已应用新布局
		void animeListContainer.offsetHeight;
		if (!shouldAnimate) {
			if (style.parentNode) {
				style.parentNode.removeChild(style);
			}
			return;
		}

		requestAnimationFrame(() => {
			if (style.parentNode) {
				style.parentNode.removeChild(style);
			}

			visibleItems.forEach((item) => {
				const first = firstPositions.get(item);
				if (!first) {
					return;
				}
				const last = item.getBoundingClientRect();

				const deltaX = Math.round(first.left - last.left);
				const deltaY = Math.round(first.top - last.top);
				const deltaW = first.width / last.width;
				const deltaH = first.height / last.height;

				if (
					Math.abs(deltaX) < 1 &&
					Math.abs(deltaY) < 1 &&
					Math.abs(deltaW - 1) < 0.01 &&
					Math.abs(deltaH - 1) < 0.01
				) {
					return;
				}

				item.style.willChange = "transform";
				item.style.transition = "none";
				item.style.transformOrigin = "top left";
				item.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
			});

			void animeListContainer.offsetHeight;
			requestAnimationFrame(() => {
				visibleItems.forEach((item) => {
					item.style.transition =
						"transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
					item.style.transform = "";
				});
				setTimeout(() => {
					visibleItems.forEach((item) => {
						item.style.transition = "";
						item.style.transformOrigin = "";
						item.style.transform = "";
						item.style.willChange = "";
					});
				}, 500);
			});
		});
	}

	/** 读取本地保存的布局并立即应用（不做动画），容器不存在时返回 false */
	function initAnimeLayout() {
		const animeListContainer = document.getElementById(containerId);
		if (!animeListContainer) {
			return false;
		}
		const currentLayout = localStorage.getItem("postListLayout") || "list";
		updateAnimeListLayout(currentLayout, false);
		requestAnimationFrame(() => {
			animeListContainer.classList.remove("opacity-0");
		});
		return true;
	}

	let retryCount = 0;
	const maxRetries = 10;

	/** 尝试初始化；容器尚未渲染时按指数退避重试，最多 10 次 */
	function tryInit() {
		if (initAnimeLayout()) {
			return;
		}
		if (retryCount < maxRetries) {
			retryCount++;
			const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
			setTimeout(tryInit, delay);
		} else {
			setTimeout(() => {
				const animeListContainer = document.getElementById(containerId);
				if (animeListContainer) {
					const currentLayout =
						localStorage.getItem("postListLayout") || "list";
					updateAnimeListLayout(currentLayout, false);
					animeListContainer.classList.remove("opacity-0");
				}
			}, 2000);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", tryInit);
	} else {
		tryInit();
	}

	window.addEventListener(
		"layoutChange",
		(event: CustomEvent<{ layout: string }>) => {
			updateAnimeListLayout(event.detail.layout);
		},
	);
}

/** 兼容旧调用方式的入口，直接转调 initAnimeLayoutHandler */
export function initLayoutListener(
	containerId: string,
	hasRightSidebars: boolean,
) {
	initAnimeLayoutHandler({ containerId, hasRightSidebars });
}
