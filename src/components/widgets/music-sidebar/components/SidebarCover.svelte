<script lang="ts">
	// 侧栏封面：复用播放器 CoverImage 的 expanded 形态，纯展示不响应点击。
	import CoverImage from "../../music-player/atoms/CoverImage.svelte";
	import type { Song } from "../../music-player/types";

	interface Props {
		currentSong: Song;
		isPlaying: boolean;
		isLoading: boolean;
	}

	const { currentSong, isPlaying, isLoading }: Props = $props();
</script>

<CoverImage
	cover={currentSong.cover}
	{isPlaying}
	{isLoading}
	size="expanded"
	interactive={false}
/>
