<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	import type { Song } from "../music-player/types";
	import SidebarCollapsedView from "./components/SidebarCollapsedView.svelte";
	import SidebarControls from "./components/SidebarControls.svelte";
	import SidebarCover from "./components/SidebarCover.svelte";
	import SidebarPlaylist from "./components/SidebarPlaylist.svelte";
	import SidebarProgress from "./components/SidebarProgress.svelte";
	import SidebarTrackInfo from "./components/SidebarTrackInfo.svelte";
	import {
		createSidebarMusicUIState,
		toggleSidebarCollapsed,
		toggleSidebarPlaylist,
	} from "./hooks/useSidebarMusicUI";

	let state: MusicPlayerState = $state();
	const sidebarUI = createSidebarMusicUIState();
	
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

	function togglePlay() {
		musicPlayerStore.toggle();
	}

	function prev() {
		musicPlayerStore.prev();
	}

	function next() {
		musicPlayerStore.next();
	}

	function toggleMode() {
		musicPlayerStore.toggleMode();
	}

	function togglePlaylistView() {
		toggleSidebarPlaylist(sidebarUI);
	}

	function handleCollapseToggle() {
		toggleSidebarCollapsed(sidebarUI);
	}

	function playIndex(index: number) {
		musicPlayerStore.playIndex(index);
	}

	function seek(time: number) {
		musicPlayerStore.seek(time);
	}

	function toggleMute() {
		musicPlayerStore.toggleMute();
	}

	function setVolume(volume: number) {
		musicPlayerStore.setVolume(volume);
	}
</script>

<div class="music-sidebar-widget" class:collapsed={sidebarUI.isCollapsed}>
	{#if sidebarUI.isCollapsed}
		<SidebarCollapsedView
			isPlaying={state.isPlaying}
			isLoading={state.isLoading}
			onExpand={handleCollapseToggle}
		/>
	{:else}
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
			<button
				class="collapse-btn ml-auto"
				onclick={handleCollapseToggle}
				aria-label="收起播放器"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
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
			show={sidebarUI.showPlaylist}
			onClose={togglePlaylistView}
			onPlaySong={playIndex}
		/>
	{/if}
</div>

<style>
	.collapse-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		color: var(--content-meta);
		transition: color 150ms ease, background 150ms ease;
		flex-shrink: 0;
	}

	.collapse-btn:hover {
		color: var(--primary);
		background: var(--btn-regular-bg);
	}

	.music-sidebar-widget.collapsed {
		padding: 0.25rem;
	}

	@media (max-width: 520px) {
		.music-sidebar-widget {
			min-width: 0;
		}

		.music-sidebar-widget > :global(div:first-child) {
			gap: 0.75rem;
			margin-bottom: 0.5rem;
		}

		.collapse-btn {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>
