import { describe, expect, it, vi } from "vitest";

import { DEFAULT_SONG } from "../constants";
import type { Song } from "../types";
import {
	createAudioPlayerState,
	handleLoadError,
	handleLoadSuccess,
	handleUserInteraction,
	loadSong,
	toggleMute,
	togglePlay,
} from "./useAudioPlayer";

function createMockAudio(overrides: Partial<HTMLAudioElement> = {}): HTMLAudioElement {
	return {
		play: vi.fn().mockResolvedValue(undefined),
		pause: vi.fn(),
		duration: 200,
		...overrides,
	} as unknown as HTMLAudioElement;
}

const sampleSong: Song = {
	id: 1,
	title: "Test Song",
	artist: "Test Artist",
	cover: "cover.webp",
	url: "song.mp3",
	duration: 180,
};

describe("createAudioPlayerState", () => {
	it("returns the default initial state", () => {
		const state = createAudioPlayerState();

		expect(state.isPlaying).toBe(false);
		expect(state.currentTime).toBe(0);
		expect(state.duration).toBe(0);
		expect(state.volume).toBe(0.7);
		expect(state.isMuted).toBe(false);
		expect(state.isLoading).toBe(false);
		expect(state.currentSong).toEqual(DEFAULT_SONG);
		expect(state.autoplayFailed).toBe(false);
		expect(state.willAutoPlay).toBe(false);
	});
});

describe("togglePlay", () => {
	it("pauses audio when currently playing", () => {
		const state = createAudioPlayerState();
		state.isPlaying = true;
		state.currentSong = sampleSong;
		const audio = createMockAudio();

		togglePlay(state, audio);

		expect(audio.pause).toHaveBeenCalled();
	});

	it("plays audio when currently paused and a valid song is loaded", () => {
		const state = createAudioPlayerState();
		state.currentSong = sampleSong;
		const audio = createMockAudio();

		togglePlay(state, audio);

		expect(audio.play).toHaveBeenCalled();
	});

	it("does nothing when audio element is missing", () => {
		const state = createAudioPlayerState();
		state.currentSong = sampleSong;

		togglePlay(state, undefined);

		expect(state.isPlaying).toBe(false);
	});

	it("does nothing when current song has no url", () => {
		const state = createAudioPlayerState();
		const audio = createMockAudio();

		togglePlay(state, audio);

		expect(audio.play).not.toHaveBeenCalled();
		expect(audio.pause).not.toHaveBeenCalled();
	});
});

describe("toggleMute", () => {
	it("flips the muted flag", () => {
		const state = createAudioPlayerState();
		expect(state.isMuted).toBe(false);

		toggleMute(state);
		expect(state.isMuted).toBe(true);

		toggleMute(state);
		expect(state.isMuted).toBe(false);
	});
});

describe("handleLoadSuccess", () => {
	it("stops loading and updates duration from audio metadata", () => {
		const state = createAudioPlayerState();
		state.isLoading = true;
		const audio = createMockAudio({ duration: 260 });

		handleLoadSuccess(state, audio);

		expect(state.isLoading).toBe(false);
		expect(state.duration).toBe(260);
		expect(state.currentSong.duration).toBe(260);
	});

	it("does not override duration when audio duration is invalid", () => {
		const state = createAudioPlayerState();
		state.isLoading = true;
		state.duration = 100;
		const audio = createMockAudio({ duration: NaN });

		handleLoadSuccess(state, audio);

		expect(state.isLoading).toBe(false);
		expect(state.duration).toBe(100);
	});

	it("attempts autoplay when willAutoPlay is true", () => {
		const state = createAudioPlayerState();
		state.willAutoPlay = true;
		const audio = createMockAudio();

		handleLoadSuccess(state, audio);

		expect(audio.play).toHaveBeenCalled();
	});

	it("attempts to resume when isPlaying is true", () => {
		const state = createAudioPlayerState();
		state.isPlaying = true;
		const audio = createMockAudio();

		handleLoadSuccess(state, audio);

		expect(audio.play).toHaveBeenCalled();
	});

	it("marks autoplay as failed when play() is rejected", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const state = createAudioPlayerState();
		state.willAutoPlay = true;
		let rejectPlay: (reason?: unknown) => void = () => {};
		const playPromise = new Promise<void>((_, reject) => {
			rejectPlay = reject;
		});
		const audio = createMockAudio({ play: vi.fn(() => playPromise) });

		handleLoadSuccess(state, audio);
		rejectPlay(new Error("Autoplay blocked"));
		await expect(playPromise).rejects.toThrow("Autoplay blocked");

		expect(state.autoplayFailed).toBe(true);
		expect(state.isPlaying).toBe(false);
		expect(warnSpy).toHaveBeenCalledWith(
			"自动播放被拦截，等待用户交互:",
			expect.any(Error),
		);
		warnSpy.mockRestore();
	});
});

describe("handleLoadError", () => {
	it("returns shouldContinue=false when current song has no url", () => {
		const state = createAudioPlayerState();
		state.currentSong = { ...DEFAULT_SONG, url: "" };

		const result = handleLoadError(state);

		expect(result.shouldContinue).toBe(false);
	});

	it("clears loading flag and indicates continuation when playback should resume", () => {
		const state = createAudioPlayerState();
		state.currentSong = sampleSong;
		state.isPlaying = true;
		state.willAutoPlay = true;
		state.isLoading = true;

		const result = handleLoadError(state);

		expect(state.isLoading).toBe(false);
		expect(result.shouldContinue).toBe(true);
	});

	it("returns shouldContinue=false when player is stopped and autoplay is not pending", () => {
		const state = createAudioPlayerState();
		state.currentSong = sampleSong;
		state.isPlaying = false;
		state.willAutoPlay = false;

		const result = handleLoadError(state);

		expect(result.shouldContinue).toBe(false);
	});
});

describe("loadSong", () => {
	it("loads a new song and sets loading when url is present", () => {
		const state = createAudioPlayerState();

		loadSong(state, sampleSong);

		expect(state.currentSong).toEqual(sampleSong);
		expect(state.isLoading).toBe(true);
		expect(state.willAutoPlay).toBe(true);
	});

	it("does not change state when song is the same as current", () => {
		const state = createAudioPlayerState();
		state.currentSong = sampleSong;
		state.isLoading = false;

		loadSong(state, sampleSong);

		expect(state.currentSong).toEqual(sampleSong);
		expect(state.isLoading).toBe(false);
		expect(state.willAutoPlay).toBe(true);
	});

	it("does not start loading when song url is empty", () => {
		const state = createAudioPlayerState();
		state.currentSong = { ...sampleSong, url: "previous.mp3" };
		const songWithoutUrl = { ...sampleSong, url: "" };

		loadSong(state, songWithoutUrl);

		expect(state.currentSong).toEqual(songWithoutUrl);
		expect(state.isLoading).toBe(false);
	});

	it("does nothing when song is undefined", () => {
		const state = createAudioPlayerState();

		loadSong(state, undefined as unknown as Song);

		expect(state.currentSong).toEqual(DEFAULT_SONG);
	});
});

describe("handleUserInteraction", () => {
	it("retries playback after a previous autoplay failure", async () => {
		const state = createAudioPlayerState();
		state.autoplayFailed = true;
		const audio = createMockAudio();

		handleUserInteraction(state, audio);
		await Promise.resolve();

		expect(audio.play).toHaveBeenCalled();
		expect(state.autoplayFailed).toBe(false);
	});

	it("does nothing when autoplay did not fail", () => {
		const state = createAudioPlayerState();
		state.autoplayFailed = false;
		const audio = createMockAudio();

		handleUserInteraction(state, audio);

		expect(audio.play).not.toHaveBeenCalled();
	});

	it("keeps autoplayFailed when retry play rejects", async () => {
		const state = createAudioPlayerState();
		state.autoplayFailed = true;
		const playPromise = Promise.reject(new Error("Still blocked"));
		const audio = createMockAudio({ play: vi.fn(() => playPromise) });

		handleUserInteraction(state, audio);
		await expect(playPromise).rejects.toThrow("Still blocked");

		expect(state.autoplayFailed).toBe(true);
	});
});
