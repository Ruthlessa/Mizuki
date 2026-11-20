<script lang="ts">
	// 音量控制（molecule）：组合音量按钮与滑条，静音时滑条显示为 0，默认插槽用于放收起按钮。
	import type { Action } from "svelte/action";

	import VolumeButton from "../atoms/VolumeButton.svelte";
	import VolumeSlider from "../atoms/VolumeSlider.svelte";

	interface Props {
		volume: number;
		isMuted: boolean;
		isVolumeDragging: boolean;
		volumeBarRef: Action<HTMLElement, undefined>;
		onVolumeButtonClick: () => void;
		onSliderPointerDown: (event: PointerEvent) => void;
		onSliderKeyDown: (event: KeyboardEvent) => void;
		ariaLabel: string;
	}

	const {
		volume,
		isMuted,
		isVolumeDragging,
		volumeBarRef,
		onVolumeButtonClick,
		onSliderPointerDown,
		onSliderKeyDown,
		ariaLabel,
	}: Props = $props();
</script>

<div class="bottom-controls flex items-center gap-2">
	<VolumeButton {volume} {isMuted} onclick={onVolumeButtonClick} />
	<VolumeSlider
		volume={isMuted ? 0 : volume}
		{isVolumeDragging}
		{volumeBarRef}
		onpointerdown={onSliderPointerDown}
		onkeydown={onSliderKeyDown}
		{ariaLabel}
	/>
	<slot />
</div>
