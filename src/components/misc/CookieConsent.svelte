<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	const CONSENT_KEY = "mizuki_cookie_consent";

	interface CookiePreferences {
		analytics: boolean;
		necessary: boolean;
	}

	let isOpen = false;
	let preferences: CookiePreferences = {
		analytics: false,
		necessary: true,
	};

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

		if (typeof document !== "undefined") {
			const openButton = document.getElementById("open_preferences_center");
			if (openButton) {
				openButton.addEventListener("click", handleOpen);
			}

			const savedConsent = localStorage.getItem(CONSENT_KEY);
			if (!savedConsent) {
				setTimeout(() => {
					isOpen = true;
				}, 2000);
			}
		}
	});

	onDestroy(() => {
		if (typeof document !== "undefined") {
			const openButton = document.getElementById("open_preferences_center");
			if (openButton) {
				openButton.removeEventListener("click", handleOpen);
			}
		}
	});
</script>

{#if typeof document !== "undefined" && isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
			<div class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
					Cookie 偏好设置
				</h3>
				<p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
					我们使用 Cookie 来改善您的浏览体验。您可以选择允许哪些类型的 Cookie。
				</p>

				<div class="space-y-4">
					<label class="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
						<input
							type="checkbox"
							checked={preferences.necessary}
							disabled
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
						/>
						<div>
							<div class="font-medium text-black dark:text-white">必要 Cookie</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								这些 Cookie 对于网站的基本功能是必需的，无法禁用。
							</div>
						</div>
					</label>

					<label class="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
						<input
							type="checkbox"
							bind:checked={preferences.analytics}
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
						/>
						<div>
							<div class="font-medium text-black dark:text-white">分析 Cookie</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								用于收集网站使用数据，帮助我们改进服务。
							</div>
						</div>
					</label>
				</div>

				<div class="mt-6 flex gap-3">
					<button
						on:click={handleAcceptNecessary}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						仅必要
					</button>
					<button
						on:click={handleAcceptAll}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						接受全部
					</button>
					<button
						on:click={handleSave}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						保存设置
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}