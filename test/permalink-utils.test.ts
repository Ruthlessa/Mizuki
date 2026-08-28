import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { permalinkConfig } from "@/config";
import {
	clearPostIdMap,
	generatePermalinkSlug,
	getPermalinkPath,
	getPostNumericId,
	hasCustomPermalink,
	initPostIdMap,
} from "@utils/permalink-utils";

// permalink-utils 是全站文章 URL 生成（post-url / content-utils）的核心：
// - initPostIdMap 的缓存语义、getPostNumericId 的未初始化兜底、
// - generatePermalinkSlug 的格式模板占位符替换（解析逻辑），
// 任何回归都会让全站文章链接错乱或互相覆盖。

type MockPost = {
	id: string;
	data: {
		published: Date;
		permalink?: string;
		alias?: string;
		category?: string;
	};
	filePath?: string;
};

function makePost(over: Partial<MockPost> & { id: string }): MockPost {
	return {
		id: over.id,
		data: {
			published: over.data?.published ?? new Date(2024, 5, 15, 9, 8, 7),
			permalink: over.data?.permalink,
			alias: over.data?.alias,
			category: over.data?.category,
		},
		filePath: over.filePath,
	};
}

describe("permalink-utils", () => {
	let origEnable: boolean;
	let origFormat: string;

	beforeEach(() => {
		origEnable = permalinkConfig.enable;
		origFormat = permalinkConfig.format;
		clearPostIdMap();
	});

	afterEach(() => {
		permalinkConfig.enable = origEnable;
		permalinkConfig.format = origFormat;
		clearPostIdMap();
	});

	describe("initPostIdMap / getPostNumericId / clearPostIdMap", () => {
		it("assigns ascending ids by published time (earliest = 1)", () => {
			const posts = [
				makePost({ id: "c", data: { published: new Date(2024, 5, 15) } }),
				makePost({ id: "a", data: { published: new Date(2024, 0, 1) } }),
				makePost({ id: "b", data: { published: new Date(2024, 2, 10) } }),
			];
			initPostIdMap(posts as any);
			// a (Jan) = 1, b (Mar) = 2, c (Jun) = 3
			assert.strictEqual(getPostNumericId("a"), 1);
			assert.strictEqual(getPostNumericId("b"), 2);
			assert.strictEqual(getPostNumericId("c"), 3);
		});

		it("returns a cached map and does not rebuild on a second call", () => {
			const first = [
				makePost({ id: "a", data: { published: new Date(2024, 0, 1) } }),
				makePost({ id: "b", data: { published: new Date(2024, 1, 1) } }),
			];
			initPostIdMap(first as any);
			assert.strictEqual(getPostNumericId("a"), 1);

			// Second call with a completely different set must return the cached map
			const second = [
				makePost({ id: "z", data: { published: new Date(2020, 0, 1) } }),
			];
			initPostIdMap(second as any);
			// cached map still maps a->1 and does NOT include z
			assert.strictEqual(getPostNumericId("a"), 1);
			assert.strictEqual(getPostNumericId("z"), 0);
		});

		it("getPostNumericId returns 0 when the map is not initialized", () => {
			assert.strictEqual(getPostNumericId("anything"), 0);
		});

		it("getPostNumericId returns 0 for an unknown id after init", () => {
			initPostIdMap([
				makePost({ id: "a", data: { published: new Date(2024, 0, 1) } }),
			] as any);
			assert.strictEqual(getPostNumericId("not-in-map"), 0);
		});

		it("clearPostIdMap forces a fresh rebuild on the next init", () => {
			initPostIdMap([
				makePost({ id: "a", data: { published: new Date(2024, 0, 1) } }),
			] as any);
			assert.strictEqual(getPostNumericId("a"), 1);

			clearPostIdMap();
			// After clearing, the map is empty -> 0
			assert.strictEqual(getPostNumericId("a"), 0);

			// Re-init with a different post -> now b is id 1
			initPostIdMap([
				makePost({ id: "b", data: { published: new Date(2024, 0, 1) } }),
			] as any);
			assert.strictEqual(getPostNumericId("b"), 1);
			assert.strictEqual(getPostNumericId("a"), 0);
		});
	});

	describe("generatePermalinkSlug", () => {
		it("uses custom permalink with leading/trailing slashes stripped", () => {
			permalinkConfig.enable = true; // must NOT override an explicit permalink
			const post = makePost({ id: "ignored", data: { permalink: "/my-custom/" } });
			assert.strictEqual(generatePermalinkSlug(post as any), "my-custom");
		});

		it("strips multiple leading/trailing slashes from a custom permalink", () => {
			const post = makePost({
				id: "ignored",
				data: { permalink: "///deep/path///" },
			});
			assert.strictEqual(generatePermalinkSlug(post as any), "deep/path");
		});

		it("custom permalink wins even when enable=false and an alias exists", () => {
			permalinkConfig.enable = false;
			const post = makePost({
				id: "ignored",
				data: { permalink: "/custom/", alias: "/alias/" },
			});
			assert.strictEqual(generatePermalinkSlug(post as any), "custom");
		});

		it("falls back to alias (slashes stripped) when enable=false and no permalink", () => {
			permalinkConfig.enable = false;
			const post = makePost({
				id: "ignored",
				data: { alias: "/my-alias/" },
			});
			assert.strictEqual(generatePermalinkSlug(post as any), "my-alias");
		});

		it("falls back to file-name slug (extension stripped) when enable=false and no permalink/alias", () => {
			permalinkConfig.enable = false;
			const post = makePost({ id: "my-post.md" });
			assert.strictEqual(generatePermalinkSlug(post as any), "my-post");
		});

		describe("format template substitution (enable=true)", () => {
			beforeEach(() => {
				permalinkConfig.enable = true;
			});

			it("substitutes %year%/%monthnum%/%day% with zero-padded values", () => {
				// June (index 5) -> 06, day 5 -> 05
				permalinkConfig.format = "%year%/%monthnum%/%day%/%postname%";
				const post = makePost({
					id: "my-post.md",
					data: { published: new Date(2024, 5, 5, 9, 8, 7) },
				});
				assert.strictEqual(
					generatePermalinkSlug(post as any),
					"2024/06/05/my-post",
				);
			});

			it("pads single-digit month and day (January)", () => {
				permalinkConfig.format = "%year%-%monthnum%-%day%";
				const post = makePost({
					id: "x.md",
					data: { published: new Date(2024, 0, 3) }, // Jan 3
				});
				assert.strictEqual(generatePermalinkSlug(post as any), "2024-01-03");
			});

			it("substitutes %hour%/%minute%/%second% with zero-padded values", () => {
				permalinkConfig.format = "%hour%:%minute%:%second%";
				const post = makePost({
					id: "x.md",
					data: { published: new Date(2024, 0, 1, 7, 6, 5) },
				});
				assert.strictEqual(generatePermalinkSlug(post as any), "07:06:05");
			});

			it("substitutes %postname% with the extension-stripped id", () => {
				permalinkConfig.format = "%postname%";
				const post = makePost({ id: "Hello-World.mdx" });
				assert.strictEqual(generatePermalinkSlug(post as any), "Hello-World");
			});

			it("substitutes %raw_postname% preserving case from filePath", () => {
				permalinkConfig.format = "%raw_postname%";
				const post = makePost({
					id: "lower-id.md",
					filePath: "src/content/posts/MyCamelCase.md",
				});
				assert.strictEqual(generatePermalinkSlug(post as any), "MyCamelCase");
			});

			it("falls back %raw_postname% to postname when filePath is absent", () => {
				permalinkConfig.format = "%raw_postname%";
				const post = makePost({ id: "no-filepath.md" });
				assert.strictEqual(generatePermalinkSlug(post as any), "no-filepath");
			});

			it("uses 'uncategorized' for %category% when category is missing", () => {
				permalinkConfig.format = "%category%-%postname%";
				const post = makePost({ id: "p.md" });
				assert.strictEqual(generatePermalinkSlug(post as any), "uncategorized-p");
			});

			it("uses the explicit category for %category%", () => {
				permalinkConfig.format = "%category%/%postname%";
				const post = makePost({
					id: "p.md",
					data: { category: "Tech" },
				});
				assert.strictEqual(generatePermalinkSlug(post as any), "Tech/p");
			});

			it("substitutes %post_id% with the initialized numeric id", () => {
				permalinkConfig.format = "%post_id%-%postname%";
				const target = makePost({
					id: "target.md",
					data: { published: new Date(2024, 5, 15) },
				});
				const earlier = makePost({
					id: "earlier.md",
					data: { published: new Date(2024, 0, 1) },
				});
				// earlier = 1, target = 2
				initPostIdMap([earlier, target] as any);
				assert.strictEqual(
					generatePermalinkSlug(target as any),
					"2-target",
				);
			});

			it("renders %post_id% as 0 when the id map is not initialized", () => {
				permalinkConfig.format = "%post_id%";
				const post = makePost({ id: "lonely.md" });
				assert.strictEqual(generatePermalinkSlug(post as any), "0");
			});

			it("combines all placeholders in one template", () => {
				permalinkConfig.format =
					"%category%/%year%/%monthnum%/%day%/%post_id%-%postname%";
				const target = makePost({
					id: "post.md",
					filePath: "src/content/posts/Post.md",
					data: {
						published: new Date(2024, 5, 5, 9, 8, 7),
						category: "Notes",
					},
				});
				const earlier = makePost({
					id: "earlier.md",
					data: { published: new Date(2024, 0, 1) },
				});
				initPostIdMap([earlier, target] as any); // earlier=1, target=2
				assert.strictEqual(
					generatePermalinkSlug(target as any),
					"Notes/2024/06/05/2-post",
				);
			});
		});
	});

	describe("hasCustomPermalink", () => {
		it("returns true when a permalink is set", () => {
			assert.ok(hasCustomPermalink({ data: { permalink: "/x/" } } as any));
		});

		it("returns false when permalink is absent", () => {
			assert.ok(!hasCustomPermalink({ data: {} } as any));
		});

		it("returns false when permalink is empty string", () => {
			assert.ok(!hasCustomPermalink({ data: { permalink: "" } } as any));
		});
	});

	describe("getPermalinkPath", () => {
		it("wraps the generated slug with leading and trailing slashes", () => {
			permalinkConfig.enable = false;
			const post = makePost({ id: "hello.md" });
			assert.strictEqual(getPermalinkPath(post as any), "/hello/");
		});

		it("wraps a custom permalink slug at the root", () => {
			permalinkConfig.enable = true;
			const post = makePost({
				id: "ignored",
				data: { permalink: "/custom/nested/" },
			});
			assert.strictEqual(getPermalinkPath(post as any), "/custom/nested/");
		});
	});
});
