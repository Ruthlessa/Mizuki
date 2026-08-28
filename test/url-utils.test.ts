import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
	getDir,
	getFileDirFromPath,
	pathsEqual,
	removeFileExtension,
} from "@utils/url-utils";

// url-utils 中的纯路径/扩展名处理函数是站点 URL 生成与 SEO 路由的底层依赖，
// 任何回归都会直接导致全站链接失效。以下覆盖其边界条件与极端输入。
describe("removeFileExtension", () => {
	it("removes .md extension", () => {
		assert.strictEqual(removeFileExtension("hello.md"), "hello");
	});

	it("removes .mdx extension", () => {
		assert.strictEqual(removeFileExtension("post.mdx"), "post");
	});

	it("removes .markdown extension", () => {
		assert.strictEqual(removeFileExtension("notes.markdown"), "notes");
	});

	it("is case-insensitive for the extension", () => {
		assert.strictEqual(removeFileExtension("Post.MD"), "Post");
		assert.strictEqual(removeFileExtension("Mixed.MdX"), "Mixed");
	});

	it("only strips a known markdown extension at the very end", () => {
		// .txt is not a markdown extension and must be preserved
		assert.strictEqual(removeFileExtension("readme.txt"), "readme.txt");
		// mid-string occurrences are not stripped
		assert.strictEqual(removeFileExtension("md.md"), "md");
		// extension must be terminal; embedded ".md" inside a path segment stays
		assert.strictEqual(
			removeFileExtension("folder.md/file.txt"),
			"folder.md/file.txt",
		);
	});

	it("leaves ids without extension untouched", () => {
		assert.strictEqual(removeFileExtension("plain-slug"), "plain-slug");
	});

	it("preserves leading path segments", () => {
		assert.strictEqual(
			removeFileExtension("2024/12/my-post.md"),
			"2024/12/my-post",
		);
	});
});

describe("pathsEqual", () => {
	it("treats identical paths as equal", () => {
		assert.ok(pathsEqual("/posts/foo/", "/posts/foo/"));
	});

	it("ignores leading and trailing slashes", () => {
		assert.ok(pathsEqual("posts/foo", "/posts/foo/"));
		assert.ok(pathsEqual("/posts/foo", "posts/foo/"));
	});

	it("is case-insensitive", () => {
		assert.ok(pathsEqual("/Posts/Foo/", "/posts/foo"));
	});

	it("returns false for genuinely different paths", () => {
		assert.ok(!pathsEqual("/posts/foo/", "/posts/bar/"));
		assert.ok(!pathsEqual("/posts/foo", "/post/foo"));
	});

	it("handles empty strings", () => {
		assert.ok(pathsEqual("", ""));
		// "" and "/" both normalize to "" => equal
		assert.ok(pathsEqual("", "/"));
	});
});

describe("getDir", () => {
	it("returns the directory portion for a nested path", () => {
		assert.strictEqual(getDir("2024/12/my-post.md"), "2024/12/");
	});

	it('returns "/" for a file in the root with no slash', () => {
		assert.strictEqual(getDir("my-post.md"), "/");
	});

	it('returns "/" for a file in the root with no slash and no extension', () => {
		assert.strictEqual(getDir("my-post"), "/");
	});

	it("strips a trailing markdown extension before computing the dir", () => {
		// extension is removed first, so the last slash determines the dir
		assert.strictEqual(getDir("folder/sub/file.md"), "folder/sub/");
	});

	it("returns the full prefix up to and including the last slash", () => {
		assert.strictEqual(getDir("a/b/c/d.md"), "a/b/c/");
	});
});

describe("getFileDirFromPath", () => {
	it("strips the leading src/ prefix and the final filename", () => {
		assert.strictEqual(
			getFileDirFromPath("src/content/posts/foo.md"),
			"content/posts",
		);
	});

	it("only removes a src/ prefix at the very start", () => {
		// "src/" not at the start is preserved
		assert.strictEqual(
			getFileDirFromPath("deep/src/posts/foo.md"),
			"deep/src/posts",
		);
	});

	it("returns the post directory for a realistic content path", () => {
		// Production posts live under src/content/posts/<slug>.md; the returned
		// basePath is used to resolve cover/inline images relative to the post.
		assert.strictEqual(
			getFileDirFromPath("src/content/posts/hello-world.md"),
			"content/posts",
		);
	});

	it("returns a nested post directory", () => {
		assert.strictEqual(
			getFileDirFromPath("src/content/posts/2024/notes.md"),
			"content/posts/2024",
		);
	});

	it("handles paths without a src/ prefix by just dropping the filename", () => {
		assert.strictEqual(
			getFileDirFromPath("content/posts/foo.md"),
			"content/posts",
		);
	});

	it("handles filenames containing dots in the directory", () => {
		assert.strictEqual(
			getFileDirFromPath("src/a.b/c.d/bar.md"),
			"a.b/c.d",
		);
	});
});
