import { describe, expect, it, vi } from "vitest";

import {
	canSkip,
	createPlaylistState,
	nextSong,
	playSong,
	previousSong,
	toggleRepeat,
	toggleShuffle,
} from "./usePlaylist";

function makePlaylist(length: number) {
	return Array.from({ length }, (_, i) => ({
		id: i + 1,
		title: `Song ${i + 1}`,
		artist: "Artist",
		cover: "cover.webp",
		url: `song${i + 1}.mp3`,
		duration: 180,
	}));
}

describe("createPlaylistState", () => {
	it("initializes with an empty playlist and default flags", () => {
		const state = createPlaylistState();

		expect(state.playlist).toEqual([]);
		expect(state.currentIndex).toBe(0);
		expect(state.isShuffled).toBe(false);
		expect(state.isRepeating).toBe(0);
	});
});

describe("toggleShuffle", () => {
	it("enables shuffle and disables repeat", () => {
		const state = createPlaylistState();
		state.isRepeating = 2;

		toggleShuffle(state);

		expect(state.isShuffled).toBe(true);
		expect(state.isRepeating).toBe(0);
	});

	it("toggles shuffle off without changing repeat", () => {
		const state = createPlaylistState();
		state.isShuffled = true;
		state.isRepeating = 1;

		toggleShuffle(state);

		expect(state.isShuffled).toBe(false);
		expect(state.isRepeating).toBe(1);
	});
});

describe("toggleRepeat", () => {
	it("cycles through repeat modes 0 -> 1 -> 2 -> 0", () => {
		const state = createPlaylistState();

		toggleRepeat(state);
		expect(state.isRepeating).toBe(1);

		toggleRepeat(state);
		expect(state.isRepeating).toBe(2);

		toggleRepeat(state);
		expect(state.isRepeating).toBe(0);
	});

	it("disables shuffle when any repeat mode is active", () => {
		const state = createPlaylistState();
		state.isShuffled = true;

		toggleRepeat(state);

		expect(state.isShuffled).toBe(false);
		expect(state.isRepeating).toBe(1);
	});
});

describe("previousSong", () => {
	it("returns the previous index in normal mode", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);
		state.currentIndex = 2;

		expect(previousSong(state)).toBe(1);
	});

	it("wraps to the last song when at the beginning", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);
		state.currentIndex = 0;

		expect(previousSong(state)).toBe(2);
	});

	it("returns the same index for a single-song playlist", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(1);

		expect(previousSong(state)).toBe(0);
	});

	it("returns the same index for an empty playlist", () => {
		const state = createPlaylistState();

		expect(previousSong(state)).toBe(0);
	});
});

describe("nextSong", () => {
	it("advances to the next index in normal mode", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);
		state.currentIndex = 0;

		expect(nextSong(state)).toBe(1);
	});

	it("wraps to the first song when at the end", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);
		state.currentIndex = 2;

		expect(nextSong(state)).toBe(0);
	});

	it("returns a different random index in shuffle mode", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(5);
		state.currentIndex = 0;
		state.isShuffled = true;

		const result = nextSong(state);

		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThan(state.playlist.length);
	});

	it("keeps returning a valid index when only two songs remain in shuffle mode", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(2);
		state.currentIndex = 0;
		state.isShuffled = true;

		const result = nextSong(state);

		expect(result).toBe(1);
	});

	it("returns the same index for a single-song playlist", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(1);

		expect(nextSong(state)).toBe(0);
	});
});

describe("playSong", () => {
	it("sets the current index when valid", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);

		expect(playSong(state, 1)).toBe(true);
		expect(state.currentIndex).toBe(1);
	});

	it("returns false and does not change index for negative index", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);

		expect(playSong(state, -1)).toBe(false);
		expect(state.currentIndex).toBe(0);
	});

	it("returns false and does not change index for out-of-bounds index", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(3);

		expect(playSong(state, 3)).toBe(false);
		expect(state.currentIndex).toBe(0);
	});
});

describe("canSkip", () => {
	it("returns true when playlist has more than one song", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(2);

		expect(canSkip(state)).toBe(true);
	});

	it("returns false when playlist has one or zero songs", () => {
		const state = createPlaylistState();
		state.playlist = makePlaylist(1);

		expect(canSkip(state)).toBe(false);
	});
});
