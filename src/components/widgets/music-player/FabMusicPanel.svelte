<script lang="ts">
	// FAB 入口下的音乐面板：复用侧栏音乐组件，提供封面、进度、控制与播放列表。
	// 数据全部来自 musicPlayerStore，订阅后随状态更新。
	import Icon from "@iconify/svelte";
	import { onDestroy, onMount } from "svelte";

	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	import Key from "../../../i18n/i18nKey";
	import { i18n } from "../../../i18n/translation";
	import SidebarControls from "../music-sidebar/components/SidebarControls.svelte";
	import SidebarCover from "../music-sidebar/components/SidebarCover.svelte";
	import SidebarPlaylist from "../music-sidebar/components/SidebarPlaylist.svelte";
	import SidebarProgress from "../music-sidebar/components/SidebarProgress.svelte";
	import SidebarTrackInfo from "../music-sidebar/components/SidebarTrackInfo.svelte";

	let state: MusicPlayerState = $state();
	let showPlaylist = $state(false);

	// 初始化状态
	state = musicPlayerStore.getState();
	let unsubscribe: (() => void) | undefined;

	onMount(() => {
		unsubscribe = musicPlayerStore.subscribe((nextState) => {
			state = nextState;
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	/** 切换播放/暂停。 */
	function togglePlay() {
		musicPlayerStore.toggle();
	}

	/** 切换到上一首。 */
	function prev() {
		musicPlayerStore.prev();
	}

	/** 切换到下一首。 */
	function next() {
		musicPlayerStore.next();
	}

	/** 切换随机/循环播放模式。 */
	function toggleMode() {
		musicPlayerStore.toggleMode();
	}

	/** 切换面板内播放列表的显隐。 */
	function togglePlaylistView() {
		showPlaylist = !showPlaylist;
	}

	/** 播放指定索引的歌曲。 */
	function playIndex(index: number) {
		musicPlayerStore.playIndex(index);
	}

	/** 跳转到指定播放时间。 */
	function seek(time: number) {
		musicPlayerStore.seek(time);
	}

	/** 切换静音。 */
	function toggleMute() {
		musicPlayerStore.toggleMute();
	}

	/** 设置音量。 */
	function setVolume(volume: number) {
		musicPlayerStore.setVolume(volume);
	}

	/** 收起面板（切回非展开态）。 */
	function collapse() {
		musicPlayerStore.toggleExpanded();
	}
</script>

<div
	class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw]"
>
	<div class="fab-music-header">
		<SidebarCover
			currentSong={state.currentSong}
			isPlaying={state.isPlaying}
			isLoading={state.isLoading}
		/>
		<SidebarTrackInfo
			currentSong={state.currentSong}
			currentTime={state.currentTime}
			duration={state.duration}
			volume={state.volume}
			isMuted={state.isMuted}
			onToggleMute={toggleMute}
			onSetVolume={setVolume}
		/>
		<button
			class="collapse-btn"
			onclick={collapse}
			aria-label={i18n(Key.musicPlayerCollapse)}
			title={i18n(Key.musicPlayerCollapse)}
		>
			<Icon icon="material-symbols:expand-more" class="text-lg" />
		</button>
	</div>

	<SidebarProgress
		currentTime={state.currentTime}
		duration={state.duration}
		onSeek={seek}
	/>

	<SidebarControls
		isPlaying={state.isPlaying}
		isShuffled={state.isShuffled}
		repeatMode={state.isRepeating}
		onToggleMode={toggleMode}
		onPrev={prev}
		onNext={next}
		onTogglePlay={togglePlay}
		onTogglePlaylist={togglePlaylistView}
	/>

	<SidebarPlaylist
		playlist={state.playlist}
		currentIndex={state.currentIndex}
		isPlaying={state.isPlaying}
		show={showPlaylist}
		onClose={togglePlaylistView}
		onPlaySong={playIndex}
	/>
</div>

<style>
	.fab-music-panel {
		border-radius: 1.25rem;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid color-mix(in srgb, var(--line-color) 65%, transparent);
		box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
	}

	:global(.dark) .fab-music-panel {
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
	}

	.fab-music-header {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 0.75rem;
	}

	.collapse-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		color: var(--content-meta);
		transition:
			color 150ms ease,
			background 150ms ease;
		flex-shrink: 0;
		margin-left: auto;
	}

	.collapse-btn:hover {
		color: var(--primary);
		background: var(--btn-regular-bg);
	}

	@media (max-width: 640px) {
		.fab-music-panel {
			padding: 0.9rem 0.85rem 0.9rem 0.9rem;
			border-radius: 1rem;
		}

		.collapse-btn {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>
