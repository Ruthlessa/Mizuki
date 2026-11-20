<script lang="ts">
	// 曲目信息（atom）：按 mini/expanded 展示标题、作者，并可选显示当前时间/总时长。
	import Key from "../../../../i18n/i18nKey";
	import { i18n } from "../../../../i18n/translation";
	import type { Song } from "../types";

	interface Props {
		song: Song;
		currentTime: number;
		duration: number;
		showTime?: boolean;
		size?: "mini" | "expanded";
	}

	const {
		song,
		currentTime,
		duration,
		showTime = false,
		size = "mini",
	}: Props = $props();

	/** 把秒数格式化为 m:ss，非法值回退为 0:00。 */
	function formatTime(seconds: number): string {
		if (!Number.isFinite(seconds) || seconds < 0) {
			return "0:00";
		}
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	/** 补全静态资源路径（相对路径统一加根前缀）。 */
	function getAssetPath(path: string): string {
		if (path.startsWith("http://") || path.startsWith("https://")) {
			return path;
		}
		if (path.startsWith("/")) {
			return path;
		}
		return `/${path}`;
	}
</script>

{#if size === "mini"}
	<div class="flex-1 min-w-0">
		<div class="text-sm font-medium text-90 truncate">{song.title}</div>
		<div class="text-xs text-50 truncate">{song.artist}</div>
	</div>
{:else}
	<div class="flex-1 min-w-0">
		<div class="song-title text-lg font-bold text-90 truncate mb-1">
			{song.title}
		</div>
		<div class="song-artist text-sm text-50 truncate">{song.artist}</div>
		{#if showTime}
			<div class="text-xs text-30 mt-1">
				{formatTime(currentTime)} / {formatTime(duration)}
			</div>
		{/if}
	</div>
{/if}
