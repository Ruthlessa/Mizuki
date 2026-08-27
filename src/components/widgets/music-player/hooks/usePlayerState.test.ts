import { describe, expect, it, vi } from "vitest";

import {
	createPlayerUIState,
	hideErrorUI,
	showErrorMessageUI,
	toggleExpandedUI,
	toggleHiddenUI,
	togglePlaylistUI,
} from "./usePlayerState";

describe("createPlayerUIState", () => {
	it("initializes with collapsed and visible player", () => {
		const state = createPlayerUIState();

		expect(state.isExpanded).toBe(false);
		expect(state.isHidden).toBe(false);
		expect(state.showPlaylist).toBe(false);
		expect(state.errorMessage).toBe("");
		expect(state.showError).toBe(false);
	});
});

describe("toggleExpandedUI", () => {
	it("expands the player and hides playlist", () => {
		const state = createPlayerUIState();
		state.showPlaylist = true;

		toggleExpandedUI(state);

		expect(state.isExpanded).toBe(true);
		expect(state.showPlaylist).toBe(false);
		expect(state.isHidden).toBe(false);
	});

	it("collapses an already expanded player", () => {
		const state = createPlayerUIState();
		state.isExpanded = true;

		toggleExpandedUI(state);

		expect(state.isExpanded).toBe(false);
	});
});

describe("toggleHiddenUI", () => {
	it("hides the player and collapses it", () => {
		const state = createPlayerUIState();
		state.isExpanded = true;
		state.showPlaylist = true;

		toggleHiddenUI(state);

		expect(state.isHidden).toBe(true);
		expect(state.isExpanded).toBe(false);
		expect(state.showPlaylist).toBe(false);
	});

	it("unhides an already hidden player", () => {
		const state = createPlayerUIState();
		state.isHidden = true;

		toggleHiddenUI(state);

		expect(state.isHidden).toBe(false);
	});
});

describe("togglePlaylistUI", () => {
	it("toggles the playlist panel", () => {
		const state = createPlayerUIState();

		togglePlaylistUI(state);
		expect(state.showPlaylist).toBe(true);

		togglePlaylistUI(state);
		expect(state.showPlaylist).toBe(false);
	});
});

describe("showErrorMessageUI", () => {
	it("displays the error and hides it after the configured duration", () => {
		vi.useFakeTimers();
		const state = createPlayerUIState();

		showErrorMessageUI(state, "Playback failed");

		expect(state.errorMessage).toBe("Playback failed");
		expect(state.showError).toBe(true);

		vi.advanceTimersByTime(3000);

		expect(state.showError).toBe(false);
		vi.useRealTimers();
	});
});

describe("hideErrorUI", () => {
	it("immediately hides the error", () => {
		const state = createPlayerUIState();
		state.showError = true;

		hideErrorUI(state);

		expect(state.showError).toBe(false);
	});
});
