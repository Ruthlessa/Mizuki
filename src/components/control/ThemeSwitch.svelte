<script lang="ts">
	import { DARK_MODE, DEFAULT_THEME, LIGHT_MODE } from "@constants/constants";
	import Icon from "@iconify/svelte";
	import { getStoredTheme, setTheme } from "@utils/setting-utils";
	import { onMount } from "svelte";

	import type { LIGHT_DARK_MODE } from "@/types/config.ts";

	const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE];
	let mode: LIGHT_DARK_MODE = $state(DEFAULT_THEME);
	let isChanging = false;

	onMount(() => {
		mode = getStoredTheme();

		// 监听 Swup 的内容替换事件
		const handleContentReplace = () => {
			if (typeof window === "undefined") {return;}
			// 使用 requestAnimationFrame 确保在下一帧更新状态，避免渲染冲突
			requestAnimationFrame(() => {
				const newMode = getStoredTheme();
				if (mode !== newMode) {
					mode = newMode;
				}
			});
		};

		// 检查 Swup 是否已经加载
		const w = window as any;
		if (w.swup && w.swup.hooks) {
			w.swup.hooks.on("content:replace", handleContentReplace);
		} else {
			const checkSwup = () => {
				if (w.swup && w.swup.hooks) {
					w.swup.hooks.on("content:replace", handleContentReplace);
					document.removeEventListener("swup:enable", checkSwup);
				}
			};
			document.addEventListener("swup:enable", checkSwup);

			// Fallback: 如果 1 秒后 Swup 仍未加载，则不再监听
			setTimeout(() => {
				document.removeEventListener("swup:enable", checkSwup);
			}, 1000);
		}

		// 页面加载完成后也同步一次状态
		if (document.readyState === "loading") {
			document.addEventListener(
				"DOMContentLoaded",
				() => {
					if (typeof window === "undefined") {return;}
					requestAnimationFrame(() => {
						const newMode = getStoredTheme();
						if (mode !== newMode) {
							mode = newMode;
						}
					});
				},
				{ once: true },
			);
		} else {
			// DOM 已经加载完成
			requestAnimationFrame(() => {
				const newMode = getStoredTheme();
				if (mode !== newMode) {
					mode = newMode;
				}
			});
		}
	});

	function switchScheme(newMode: LIGHT_DARK_MODE) {
		// 防止连续快速点击
		if (isChanging) {
			return;
		}

		isChanging = true;
		mode = newMode;
		setTheme(newMode);

		// 50ms 后重置状态，防止过快切换
		setTimeout(() => {
			isChanging = false;
		}, 50);
	}

	function toggleScheme() {
		if (isChanging) {
			return;
		}

		let i = 0;
		for (; i < seq.length; i++) {
			if (seq[i] === mode) {
				break;
			}
		}
		switchScheme(seq[(i + 1) % seq.length]);
	}
</script>

<button
	aria-label="Light/Dark Mode"
	class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn z-50"
	id="scheme-switch"
	onclick={toggleScheme}
	data-mode={mode}
>
	<div
		class="absolute transition-all duration-300 ease-in-out"
		class:opacity-0={mode !== LIGHT_MODE}
		class:rotate-180={mode !== LIGHT_MODE}
	>
		<Icon
			icon="material-symbols:wb-sunny-outline-rounded"
			class="text-[1.25rem]"
		></Icon>
	</div>
	<div
		class="absolute transition-all duration-300 ease-in-out"
		class:opacity-0={mode !== DARK_MODE}
		class:rotate-180={mode !== DARK_MODE}
	>
		<Icon
			icon="material-symbols:dark-mode-outline-rounded"
			class="text-[1.25rem]"
		></Icon>
	</div>
</button>

<style>
	/* 确保主题切换按钮的背景色即时更新 */
	.theme-switch-btn::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}
</style>
