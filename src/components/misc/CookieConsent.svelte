<script lang="ts">
	import { onMount } from "svelte";

	const CONSENT_KEY = "mizuki_cookie_consent";

	interface CookiePreferences {
		analytics: boolean;
		necessary: boolean;
	}

	let isOpen = $state(false);
	// 自动弹出的提示条不遮挡页面，用户主动打开时才使用全屏弹窗
	let isAutoPrompt = $state(false);
	let preferences = $state<CookiePreferences>({
		analytics: false,
		necessary: true,
	});

	const loadPreferences = (): CookiePreferences => {
		if (typeof localStorage === "undefined") {
			return { analytics: false, necessary: true };
		}
		const saved = localStorage.getItem(CONSENT_KEY);
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				return { analytics: false, necessary: true };
			}
		}
		return { analytics: false, necessary: true };
	};

	const savePreferences = (prefs: CookiePreferences) => {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
		}
		preferences = prefs;
		isOpen = false;
		applyPreferences(prefs);
	};

	const applyPreferences = (prefs: CookiePreferences) => {
		if (prefs.analytics && typeof document !== "undefined") {
			loadAnalyticsScript();
		}
	};

	const loadAnalyticsScript = () => {
		const script = document.createElement("script");
		script.src = "https://analytics.example.com/script.js";
		script.async = true;
		document.head.appendChild(script);
	};

	const handleOpen = () => {
		isAutoPrompt = false;
		isOpen = true;
	};

	const handleAcceptAll = () => {
		savePreferences({ analytics: true, necessary: true });
	};

	const handleAcceptNecessary = () => {
		savePreferences({ analytics: false, necessary: true });
	};

	const handleSave = () => {
		savePreferences(preferences);
	};

	onMount(() => {
		preferences = loadPreferences();

		if (
			typeof document !== "undefined" &&
			typeof localStorage !== "undefined"
		) {
			const openButton = document.getElementById(
				"open_preferences_center",
			);
			if (openButton) {
				openButton.addEventListener("click", handleOpen);
			}

			const savedConsent = localStorage.getItem(CONSENT_KEY);
			if (!savedConsent) {
				setTimeout(() => {
					isAutoPrompt = true;
					isOpen = true;
				}, 2000);
			}
		}
	});
</script>

{#if typeof document !== "undefined" && isOpen}
	{#if isAutoPrompt}
		<div
			class="pointer-events-none fixed inset-x-0 bottom-0 z-[45] pl-3 pr-16 pb-3 sm:pr-3"
		>
			<div
				class="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-xl border border-black/10 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:gap-4 dark:border-white/10 dark:bg-gray-800/95"
			>
				<p
					class="text-xs leading-relaxed text-gray-600 sm:flex-1 sm:text-sm dark:text-gray-400"
				>
					我们使用 Cookie 来改善您的浏览体验。
				</p>
				<div
					class="flex shrink-0 items-center justify-start gap-2 sm:justify-end"
				>
					<button
						type="button"
						onclick={handleAcceptNecessary}
						class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						仅必要
					</button>
					<button
						type="button"
						onclick={handleAcceptAll}
						class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
					>
						接受全部
					</button>
					<button
						type="button"
						onclick={() => (isAutoPrompt = false)}
						class="text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
					>
						自定义
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		>
		<div
			class="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl"
		>
			<div class="p-6">
				<h3
					class="mb-4 text-lg font-semibold text-black dark:text-white"
				>
					Cookie 偏好设置
				</h3>
				<p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
					我们使用 Cookie 来改善您的浏览体验。您可以选择允许哪些类型的
					Cookie。
				</p>

				<div class="space-y-4">
					<label
						class="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<input
							type="checkbox"
							checked={preferences.necessary}
							disabled
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
						/>
						<div>
							<div class="font-medium text-black dark:text-white">
								必要 Cookie
							</div>
							<div
								class="text-sm text-gray-500 dark:text-gray-400"
							>
								这些 Cookie
								对于网站的基本功能是必需的，无法禁用。
							</div>
						</div>
					</label>

					<label
						class="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<input
							type="checkbox"
							bind:checked={preferences.analytics}
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
						/>
						<div>
							<div class="font-medium text-black dark:text-white">
								分析 Cookie
							</div>
							<div
								class="text-sm text-gray-500 dark:text-gray-400"
							>
								用于收集网站使用数据，帮助我们改进服务。
							</div>
						</div>
					</label>
				</div>

				<div class="mt-6 flex gap-3">
					<button
						type="button"
						onclick={handleAcceptNecessary}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						仅必要
					</button>
					<button
						type="button"
						onclick={handleAcceptAll}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						接受全部
					</button>
					<button
						type="button"
						onclick={handleSave}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						保存设置
					</button>
				</div>
			</div>
		</div>
	</div>
	{/if}
{/if}
