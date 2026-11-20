<script lang="ts">
	/**
	 * 文章列表布局切换按钮：在列表（list）与网格（grid）模式间切换。
	 * 用于列表页工具栏，偏好写入本地存储，并通过自定义事件通知列表组件。
	 */
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import { onDestroy, onMount } from "svelte";

	import { sidebarLayoutConfig, siteConfig } from "../../config";

	type LayoutMode = "list" | "grid";

	type Props = {
		currentLayout?: LayoutMode;
	};

	// 从父组件接收当前的初始布局模式
	const { currentLayout = "list" }: Props = $props();

	let mounted = $state(false);
	let isSmallScreen = $state(false);
	let isSwitching = $state(false);
	let userPreference = $state<LayoutMode>("list");
	let mediaQueryList: MediaQueryList | null = null;
	let hasWindow = typeof window !== "undefined";

	const BREAKPOINT =
		sidebarLayoutConfig.responsive?.breakpoints?.desktop ?? 1280;

	const effectiveLayout = $derived(isSmallScreen ? "list" : userPreference);

	$effect(() => {
		if (mounted && hasWindow) {
			dispatchLayoutChange(effectiveLayout);
		}
	});

	/** 通过自定义事件把最新布局广播给列表等消费方 */
	function dispatchLayoutChange(layout: LayoutMode) {
		if (hasWindow) {
			window.dispatchEvent(
				new CustomEvent("layoutChange", {
					detail: { layout },
				}),
			);
		}
	}

	/** 同时写入 sessionStorage 与 localStorage，兼顾会话内与长期记忆 */
	function updateStorage(layout: LayoutMode) {
		if (hasWindow) {
			sessionStorage.setItem("postListLayout", layout);
			localStorage.setItem("postListLayout", layout);
		}
	}

	/** 读取本次会话保存的布局模式，非法值返回 null */
	function getSavedSessionLayout(): LayoutMode | null {
		if (!hasWindow) {
			return null;
		}
		const saved = sessionStorage.getItem("postListLayout");
		return saved === "list" || saved === "grid" ? saved : null;
	}

	/** 在小屏以外的场景切换布局，并加锁避免动画期间重复触发 */
	function switchLayout() {
		if (!mounted || isSmallScreen || isSwitching) {
			return;
		}

		isSwitching = true;
		const newLayout = userPreference === "list" ? "grid" : "list";
		userPreference = newLayout;
		updateStorage(newLayout);
	}

	/** 图标旋转动画结束后解锁，允许下一次切换 */
	function onAnimationEnd() {
		isSwitching = false;
	}

	/** 监听断点变化，小屏时强制退回列表模式 */
	function handleMediaQueryChange(e: MediaQueryListEvent | MediaQueryList) {
		isSmallScreen = !e.matches;
	}

	const cleanupFunctions: (() => void)[] = [];

	// 挂载后恢复用户偏好、监听断点与 Swup 事件；所有副作用统一登记以便卸载时清理
	onMount(() => {
		if (!hasWindow) {
			mounted = false;
			return;
		}

		hasWindow = true;
		mounted = true;

		const sessionLayout = getSavedSessionLayout();
		const defaultLayout = siteConfig.postListLayout
			.defaultMode as LayoutMode;

		if (sessionLayout) {
			userPreference = sessionLayout;
			if (localStorage.getItem("postListLayout") !== sessionLayout) {
				localStorage.setItem("postListLayout", sessionLayout);
			}
		} else {
			userPreference = defaultLayout;
			updateStorage(defaultLayout);
		}

		try {
			mediaQueryList = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
			handleMediaQueryChange(mediaQueryList);

			if (mediaQueryList.addEventListener) {
				mediaQueryList.addEventListener("change", handleMediaQueryChange);
				cleanupFunctions.push(() => {
					mediaQueryList?.removeEventListener("change", handleMediaQueryChange);
				});
			} else {
				mediaQueryList.addListener(handleMediaQueryChange);
				cleanupFunctions.push(() => {
					mediaQueryList?.removeListener(handleMediaQueryChange);
				});
			}

			/** 响应其它组件的布局变更事件，保持按钮状态同步 */
			const handleCustomEvent = (
				event: CustomEvent<{ layout: LayoutMode }>,
			) => {
				if (event.detail?.layout) {
					userPreference = event.detail.layout;
				}
			};

			/** Swup 跳转后延迟重新读取布局偏好，等待新页面初始化完成 */
			const handleSwupEvent = () => {
				setTimeout(() => {
					const saved = getSavedSessionLayout();
					if (saved) {
						userPreference = saved;
					} else {
						userPreference = siteConfig.postListLayout
							.defaultMode as LayoutMode;
					}
				}, 200);
			};

			window.addEventListener(
				"layoutChange",
				handleCustomEvent as EventListener,
			);
			cleanupFunctions.push(() => {
				window.removeEventListener(
					"layoutChange",
					handleCustomEvent as EventListener,
				);
			});

			const swup = (window as any).swup;
			if (swup?.hooks) {
				swup.hooks.on("content:replace", handleSwupEvent);
				swup.hooks.on("page:view", handleSwupEvent);
				cleanupFunctions.push(() => {
					swup.hooks.off("content:replace", handleSwupEvent);
					swup.hooks.off("page:view", handleSwupEvent);
				});
			} else {
				window.addEventListener("popstate", handleSwupEvent);
				cleanupFunctions.push(() => {
					window.removeEventListener("popstate", handleSwupEvent);
				});
			}
		} catch (error) {
			console.error("LayoutSwitch initialization error:", error);
		}
	});

	// 卸载时统一执行登记的清理函数，移除监听与 Swup 钩子
	onDestroy(() => {
		cleanupFunctions.forEach((fn) => fn());
	});
</script>

{#if mounted && siteConfig.postListLayout.allowSwitch && !isSmallScreen}
	<button
		type="button"
		aria-label={userPreference === "list"
			? i18n(I18nKey.switchToGridMode)
			: i18n(I18nKey.switchToListMode)}
		aria-pressed={userPreference === "grid"}
		class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 flex items-center justify-center theme-switch-btn {isSwitching
			? 'switching'
			: ''}"
		on:click={switchLayout}
		disabled={isSwitching}
		title={userPreference === "list"
			? i18n(I18nKey.switchToGridMode)
			: i18n(I18nKey.switchToListMode)}
	>
		<div
			class="icon-container w-5 h-5 flex items-center justify-center relative"
			on:animationend={onAnimationEnd}
		>
			{#if userPreference === "list"}
				<svg
					class="w-5 h-5 icon-transition"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
				</svg>
			{:else}
				<svg
					class="w-5 h-5 icon-transition"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"
					/>
				</svg>
			{/if}
		</div>
	</button>
{/if}

<style>
	.theme-switch-btn::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}

	.icon-transition {
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s ease;
	}
	.switching {
		pointer-events: none;
	}
	.switching .icon-transition {
		animation: iconRotate 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}
	@keyframes iconRotate {
		0% {
			transform: rotate(0deg) scale(1);
			opacity: 1;
		}
		50% {
			transform: rotate(180deg) scale(0.8);
			opacity: 0.5;
		}
		100% {
			transform: rotate(360deg) scale(1);
			opacity: 1;
		}
	}
	.theme-switch-btn:not(.switching):hover .icon-transition {
		transform: scale(1.1);
	}
	.theme-switch-btn:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-switch-btn::before,
		.icon-transition {
			transition: none !important;
		}
		.switching .icon-transition {
			animation: none;
		}
		.theme-switch-btn:not(.switching):hover .icon-transition {
			transform: none;
		}
	}
</style>
