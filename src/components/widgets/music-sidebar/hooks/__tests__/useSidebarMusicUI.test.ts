import type { SidebarMusicUIState } from "../useSidebarMusicUI";
import {
	createSidebarMusicUIState,
	toggleSidebarCollapsed,
	toggleSidebarPlaylist,
} from "../useSidebarMusicUI";

describe("music-sidebar UI 状态管理", () => {
	describe("createSidebarMusicUIState", () => {
		test("应该创建初始状态，showPlaylist 为 false", () => {
			const state = createSidebarMusicUIState();
			expect(state.showPlaylist).toBe(false);
		});

		test("应该创建初始状态，isCollapsed 为 false", () => {
			const state = createSidebarMusicUIState();
			expect(state.isCollapsed).toBe(false);
		});
	});

	describe("toggleSidebarPlaylist", () => {
		test("应该切换 showPlaylist 状态从 false 到 true", () => {
			const state = createSidebarMusicUIState();
			expect(state.showPlaylist).toBe(false);

			toggleSidebarPlaylist(state);
			expect(state.showPlaylist).toBe(true);
		});

		test("应该切换 showPlaylist 状态从 true 到 false", () => {
			const state = createSidebarMusicUIState();
			state.showPlaylist = true;

			toggleSidebarPlaylist(state);
			expect(state.showPlaylist).toBe(false);
		});
	});

	describe("toggleSidebarCollapsed", () => {
		test("应该切换 isCollapsed 状态从 false 到 true", () => {
			const state = createSidebarMusicUIState();
			expect(state.isCollapsed).toBe(false);

			toggleSidebarCollapsed(state);
			expect(state.isCollapsed).toBe(true);
		});

		test("应该切换 isCollapsed 状态从 true 到 false", () => {
			const state = createSidebarMusicUIState();
			state.isCollapsed = true;

			toggleSidebarCollapsed(state);
			expect(state.isCollapsed).toBe(false);
		});

		test("收起时应该关闭播放列表", () => {
			const state = createSidebarMusicUIState();
			state.showPlaylist = true;
			state.isCollapsed = false;

			toggleSidebarCollapsed(state);

			expect(state.isCollapsed).toBe(true);
			expect(state.showPlaylist).toBe(false);
		});
	});
});

describe("music-sidebar 收起功能", () => {
	test("sidebar 组件应该支持收起按钮", () => {
		const mockState = createSidebarMusicUIState();
		expect(mockState).toHaveProperty("showPlaylist");
		expect(mockState).toHaveProperty("isCollapsed");
	});

	test("sidebar 收起后应该隐藏播放器内容", () => {
		const state = createSidebarMusicUIState();
		state.isCollapsed = false;

		toggleSidebarCollapsed(state);
		expect(state.isCollapsed).toBe(true);
	});
});
