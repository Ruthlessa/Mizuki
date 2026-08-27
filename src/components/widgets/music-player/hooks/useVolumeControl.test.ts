import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_KEY_VOLUME } from "../constants";
import { createAudioPlayerState } from "./useAudioPlayer";
import {
	createVolumeDragState,
	handleVolumeKeyDown,
	handleVolumeMove,
	loadVolumeFromStorage,
	saveVolumeToStorage,
	startVolumeDrag,
	stopVolumeDrag,
} from "./useVolumeControl";

function createMockPointerEvent(overrides: Partial<PointerEvent> = {}): PointerEvent {
	return {
		preventDefault: vi.fn(),
		pointerId: 1,
		clientX: 50,
		...overrides,
	} as unknown as PointerEvent;
}

function createMockVolumeBar(overrides: Partial<HTMLElement> = {}): HTMLElement {
	return {
		getBoundingClientRect: () =>
			({
				left: 0,
				width: 100,
			}) as DOMRect,
		setPointerCapture: vi.fn(),
		releasePointerCapture: vi.fn(),
		...overrides,
	} as unknown as HTMLElement;
}

describe("createVolumeDragState", () => {
	it("initializes drag state", () => {
		const state = createVolumeDragState();

		expect(state.isVolumeDragging).toBe(false);
		expect(state.isPointerDown).toBe(false);
		expect(state.volumeBarRect).toBeNull();
		expect(state.rafId).toBeNull();
	});
});

describe("loadVolumeFromStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("loads a saved volume value", () => {
		localStorage.setItem(STORAGE_KEY_VOLUME, "0.42");
		const state = createAudioPlayerState();

		loadVolumeFromStorage(state);

		expect(state.volume).toBe(0.42);
	});

	it("keeps default volume when storage is empty", () => {
		const state = createAudioPlayerState();

		loadVolumeFromStorage(state);

		expect(state.volume).toBe(0.7);
	});

	it("ignores invalid storage values", () => {
		localStorage.setItem(STORAGE_KEY_VOLUME, "not-a-number");
		const state = createAudioPlayerState();

		loadVolumeFromStorage(state);

		expect(state.volume).toBe(0.7);
	});
});

describe("saveVolumeToStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("persists the current volume", () => {
		const state = createAudioPlayerState();
		state.volume = 0.35;

		saveVolumeToStorage(state);

		expect(localStorage.getItem(STORAGE_KEY_VOLUME)).toBe("0.35");
	});
});

describe("startVolumeDrag", () => {
	it("sets pointer capture and updates volume based on pointer position", () => {
		const state = createAudioPlayerState();
		const dragState = createVolumeDragState();
		const volumeBar = createMockVolumeBar();
		const event = createMockPointerEvent({ clientX: 75 });
		const audio = { volume: 0 } as unknown as HTMLAudioElement;

		startVolumeDrag(event, dragState, volumeBar, audio, state);

		expect(volumeBar.setPointerCapture).toHaveBeenCalledWith(1);
		expect(dragState.isPointerDown).toBe(true);
		expect(state.volume).toBe(0.75);
	});

	it("does nothing when volume bar is missing", () => {
		const state = createAudioPlayerState();
		const dragState = createVolumeDragState();
		const event = createMockPointerEvent();
		const audio = {} as HTMLAudioElement;

		startVolumeDrag(event, dragState, null, audio, state);

		expect(dragState.isPointerDown).toBe(false);
	});
});

describe("handleVolumeMove", () => {
	it("updates volume when pointer is held down", async () => {
		const state = createAudioPlayerState();
		const dragState = createVolumeDragState();
		dragState.isPointerDown = true;
		const volumeBar = createMockVolumeBar();
		const event = createMockPointerEvent({ clientX: 25 });
		const audio = { volume: 0 } as unknown as HTMLAudioElement;

		handleVolumeMove(event, dragState, volumeBar, audio, state);
		await new Promise((resolve) => requestAnimationFrame(resolve));

		expect(dragState.isVolumeDragging).toBe(true);
		expect(state.volume).toBe(0.25);
	});

	it("does nothing when pointer is not held down", () => {
		const state = createAudioPlayerState();
		const dragState = createVolumeDragState();
		const volumeBar = createMockVolumeBar();
		const event = createMockPointerEvent({ clientX: 25 });
		const audio = { volume: 0 } as unknown as HTMLAudioElement;

		handleVolumeMove(event, dragState, volumeBar, audio, state);

		expect(state.volume).toBe(0.7);
	});
});

describe("stopVolumeDrag", () => {
	it("releases capture, resets drag state, and saves volume", () => {
		const state = createAudioPlayerState();
		state.volume = 0.5;
		const dragState = createVolumeDragState();
		dragState.isPointerDown = true;
		dragState.isVolumeDragging = true;
		const volumeBar = createMockVolumeBar();
		const event = createMockPointerEvent();

		stopVolumeDrag(event, dragState, volumeBar, state);

		expect(volumeBar.releasePointerCapture).toHaveBeenCalledWith(1);
		expect(dragState.isPointerDown).toBe(false);
		expect(dragState.isVolumeDragging).toBe(false);
		expect(localStorage.getItem(STORAGE_KEY_VOLUME)).toBe("0.5");
	});

	it("does nothing when pointer was not held down", () => {
		const state = createAudioPlayerState();
		const dragState = createVolumeDragState();
		const volumeBar = createMockVolumeBar();
		const event = createMockPointerEvent();

		stopVolumeDrag(event, dragState, volumeBar, state);

		expect(volumeBar.releasePointerCapture).not.toHaveBeenCalled();
	});
});

describe("handleVolumeKeyDown", () => {
	it("toggles mute on Enter key", () => {
		const toggleMute = vi.fn();
		const event = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;

		handleVolumeKeyDown(event, toggleMute);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(toggleMute).toHaveBeenCalled();
	});

	it("prevents default on Space without toggling mute", () => {
		const toggleMute = vi.fn();
		const event = { key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent;

		handleVolumeKeyDown(event, toggleMute);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(toggleMute).not.toHaveBeenCalled();
	});

	it("ignores other keys", () => {
		const toggleMute = vi.fn();
		const event = { key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent;

		handleVolumeKeyDown(event, toggleMute);

		expect(event.preventDefault).not.toHaveBeenCalled();
		expect(toggleMute).not.toHaveBeenCalled();
	});
});
