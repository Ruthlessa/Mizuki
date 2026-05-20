<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import { onMount, onDestroy } from "svelte";

	import { sidebarLayoutConfig, siteConfig } from "../../config";

	type LayoutMode = "list" | "grid";

	export let currentLayout: LayoutMode = "list";

	let mounted = false;
	let isSmallScreen = false;
	let isSwitching = false;
	let userPreference: LayoutMode = "list";
	let mediaQueryList: MediaQueryList | null = null;
	let hasWindow = typeof window !== "undefined";

	const BREAKPOINT =
		sidebarLayoutConfig.responsive?.breakpoints?.desktop ?? 1280;

	$: currentLayout = isSmallScreen ? "list" : userPreference;

	$: if (mounted && hasWindow) {
		dispatchLayoutChange(currentLayout);
	}

	function dispatchLayoutChange(layout: LayoutMode) {
		if (hasWindow) {
			window.dispatchEvent(
				new CustomEvent("layoutChange", {
					detail: { layout },
				}),
			);
		}
	}

	function updateStorage(layout: LayoutMode) {
		if (hasWindow) {
			sessionStorage.setItem("postListLayout", layout);
			localStorage.setItem("postListLayout", layout);
		}
	}

	function getSavedSessionLayout(): LayoutMode | null {
		if (!hasWindow) return null;
		const saved = sessionStorage.getItem("postListLayout");
		return (saved === "list" || saved === "grid") ? saved : null;
	}

	function switchLayout() {
		if (!mounted || isSmallScreen || isSwitching) {
			return;
		}

		isSwitching = true;
		const newLayout = userPreference === "list" ? "grid" : "list";
		userPreference = newLayout;
		updateStorage(newLayout);
	}

	function onAnimationEnd() {
		isSwitching = false;
	}

	function handleMediaQueryChange(e: MediaQueryListEvent | MediaQueryList) {
		isSmallScreen = !e.matches;
	}

	let cleanupFunctions: (() => void)[] = [];

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

			const handleCustomEvent = (
				event: CustomEvent<{ layout: LayoutMode }>,
			) => {
				if (event.detail?.layout) {
					userPreference = event.detail.layout;
				}
			};

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
