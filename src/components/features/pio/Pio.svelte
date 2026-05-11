<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import { pioConfig } from "@/config";

	import type { PioProps } from "./types";

	export let config: Partial<PioProps["config"]> = {};

	const pioOptions = {
		mode: config?.mode ?? pioConfig.mode,
		hidden: config?.hiddenOnMobile ?? pioConfig.hiddenOnMobile,
		content: config?.dialog ?? pioConfig.dialog ?? {},
		model: config?.models ??
			pioConfig.models ?? ["/pio/models/pio/model.json"],
	};

	let pioInstance: any = null;
	let pioInitialized = false;
	let pioContainer: HTMLDivElement | null = null;
	let pioCanvas: HTMLCanvasElement | null = null;

	function initPio() {
		if (
			typeof window !== "undefined" &&
			typeof (window as any).Paul_Pio !== "undefined"
		) {
			try {
				if (pioContainer && pioCanvas && !pioInitialized) {
					// 确保 canvas 可见
					pioCanvas.style.display = "block";
					pioContainer.style.display = "block";
					
					pioInstance = new (window as any).Paul_Pio(pioOptions);
					pioInitialized = true;
					console.log("Pio initialized successfully (Svelte)");
				} else if (!pioContainer || !pioCanvas) {
					console.warn("Pio DOM elements not found, retrying...");
					setTimeout(initPio, 100);
				}
			} catch (e) {
				console.error("Pio initialization error:", e);
			}
		} else {
			setTimeout(initPio, 100);
		}
	}

	function loadPioAssets() {
		if (typeof window === "undefined") {
			return;
		}

		const loadScript = (src: string, id: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				if (document.querySelector(`#${id}`)) {
					resolve();
					return;
				}
				const script = document.createElement("script");
				script.id = id;
				script.src = src;
				script.async = true;
				script.onload = () => resolve();
				script.onerror = reject;
				document.head.appendChild(script);
			});
		};

		const loadWithIdle = () => {
			console.log("Loading Pio assets...");
			loadScript("/pio/static/l2d.js", "pio-l2d-script")
				.then(() => {
					console.log("l2d.js loaded");
					return loadScript("/pio/static/pio.js", "pio-main-script");
				})
				.then(() => {
					console.log("pio.js loaded");
					setTimeout(initPio, 100);
				})
				.catch((error) => {
					console.error("Failed to load Pio scripts:", error);
				});
		};

		// 立即开始加载，不等待 idle
		setTimeout(loadWithIdle, 500);
	}

	function handlePageTransition() {
		if (pioInstance) {
			console.log("Pio page transition detected, refreshing instance");
			// 重新初始化 PIO 实例以确保它在页面切换后正常工作
			pioInitialized = false;
			pioInstance = null;
			setTimeout(initPio, 100);
		}
	}

	onMount(() => {
		if (!pioConfig.enable) {
			console.log("Pio is disabled in config");
			return;
		}

		if (
			pioConfig.hiddenOnMobile &&
			window.matchMedia("(max-width: 1280px)").matches
		) {
			console.log("Pio is hidden on mobile");
			return;
		}

		console.log("Pio component mounted");
		loadPioAssets();

		// 监听 swup 页面切换事件
		if (typeof window !== "undefined" && (window as any).swup) {
			(window as any).swup.hooks.on("page:view", handlePageTransition);
		}

		// 监听 popstate 事件（浏览器前进/后退）
		window.addEventListener("popstate", handlePageTransition);
	});

	onDestroy(() => {
		console.log("Pio Svelte component destroyed (keeping instance alive)");

		// 移除事件监听器
		if (typeof window !== "undefined") {
			if ((window as any).swup) {
				(window as any).swup.hooks.off(
					"page:view",
					handlePageTransition,
				);
			}

			window.removeEventListener("popstate", handlePageTransition);
		}
	});
</script>

{#if pioConfig.enable}
	<div
		class={`pio-container ${pioConfig.position || "right"}`}
		bind:this={pioContainer}
		style="display: block;"
	>
		<div class="pio-action"></div>
		<canvas
			id="pio"
			bind:this={pioCanvas}
			width={pioConfig.width || 280}
			height={pioConfig.height || 250}
			style="display: block;"
		></canvas>
	</div>
{/if}

<style>
	/* Pio 相关样式将通过外部CSS文件加载 */
</style>
