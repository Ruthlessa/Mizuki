<script lang="ts">
	/** Live2D 看板娘组件：懒加载 Pio 资源，并在 swup 页面切换后重建实例；通常由全局布局挂载。 */
	import { onDestroy, onMount } from "svelte";

	import { pioConfig } from "@/config";

	import type { PioProps } from "./types";

	type Props = {
		config?: Partial<PioProps["config"]>;
	};

	const { config = {} }: Props = $props();

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

	/** 轮询等待 SDK 与 DOM 容器就绪后创建看板娘实例，避免脚本尚未加载完成。 */
	function initPio() {
		if (
			typeof window !== "undefined" &&
			typeof (window as any).Paul_Pio !== "undefined"
		) {
			try {
				if (pioContainer && pioCanvas && !pioInitialized) {
					// 清除 localStorage 中的隐藏设置，强制显示
					localStorage.removeItem("posterGirl");

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

	/** 在浏览器空闲时按顺序加载 l2d.js 与 pio.js，减少对首屏渲染的影响。 */
	function loadPioAssets() {
		if (typeof window === "undefined") {
			return;
		}

		/** 动态注入脚本标签，已存在同 id 脚本则直接复用，返回加载结果 Promise。 */
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

		/** 串行加载两个依赖脚本，全部就绪后再触发看板娘初始化。 */
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

		// 首屏优先：Live2D 纹理约 1.6MB，等页面空闲（或最多 3.5s）后再加载，
		// 避免与首屏图片、字体、脚本争抢带宽
		if (typeof window.requestIdleCallback === "function") {
			window.requestIdleCallback(loadWithIdle, { timeout: 3500 });
		} else {
			setTimeout(loadWithIdle, 3500);
		}
	}

	/** 页面切换后丢弃旧实例并重新初始化，避免看板娘残留或失效。 */
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
	>
		<div class="pio-action"></div>
		<canvas
			id="pio"
			bind:this={pioCanvas}
			width={pioConfig.width || 280}
			height={pioConfig.height || 250}
		></canvas>
	</div>
{/if}

<style>
	/* Pio 相关样式将通过外部CSS文件加载 */
</style>
