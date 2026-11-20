<script lang="ts">
	// 播放控制（molecule）：排列随机、上一首、播放/暂停、下一首与循环按钮，交互全部由父级回调承担。
	import ModeButton from "../atoms/ModeButton.svelte";
	import NextButton from "../atoms/NextButton.svelte";
	import PlayButton from "../atoms/PlayButton.svelte";
	import PrevButton from "../atoms/PrevButton.svelte";
	import type { RepeatMode } from "../types";

	interface Props {
		isPlaying: boolean;
		isLoading: boolean;
		isShuffled: boolean;
		isRepeating: RepeatMode;
		canSkip: boolean;
		onPlayClick: () => void;
		onPrevClick: () => void;
		onNextClick: () => void;
		onShuffleClick: () => void;
		onRepeatClick: () => void;
	}

	const {
		isPlaying,
		isLoading,
		isShuffled,
		isRepeating,
		canSkip,
		onPlayClick,
		onPrevClick,
		onNextClick,
		onShuffleClick,
		onRepeatClick,
	}: Props = $props();
</script>

<div class="controls flex items-center justify-center gap-2 mb-4">
	<ModeButton mode="shuffle" isActive={isShuffled} onclick={onShuffleClick} />
	<PrevButton onclick={onPrevClick} disabled={false} />
	<PlayButton {isPlaying} {isLoading} onclick={onPlayClick} />
	<NextButton onclick={onNextClick} disabled={false} />
	<ModeButton
		mode="repeat"
		isActive={isRepeating > 0}
		repeatMode={isRepeating}
		onclick={onRepeatClick}
	/>
</div>
