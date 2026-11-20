<script lang="ts">
	// 侧栏音乐客户端：订阅 musicPlayerStore，把播放状态分发给封面/信息/进度/控制/列表子组件。
	// 仅在客户端渲染，卸载时取消订阅防止回调泄漏。
	import { onDestroy, onMount } from "svelte";

	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	import type { Song } from "../music-player/types";
	import SidebarControls from "./components/SidebarControls.svelte";
	import SidebarCover from "./components/SidebarCover.svelte";
	import SidebarPlaylist from "./components/SidebarPlaylist.svelte";
	import SidebarProgress from "./components/SidebarProgress.svelte";
	import SidebarTrackInfo from "./components/SidebarTrackInfo.svelte";

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

	/** 切换侧栏内播放列表的显隐。 */
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
</script>

<div class="music-sidebar-widget">
	<div class="flex items-center gap-3 mb-2.5">
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
	@media (max-width: 520px) {
		.music-sidebar-widget {
			min-width: 0;
		}

		.music-sidebar-widget > :global(div:first-child) {
			gap: 0.75rem;
			margin-bottom: 0.5rem;
		}
	}
</style>
