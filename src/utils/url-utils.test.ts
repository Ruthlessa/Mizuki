import { describe, expect, it } from "vitest";

import {
	getCategoryUrl,
	getDir,
	getFileDirFromPath,
	getPostUrlByAlias,
	getPostUrlBySlug,
	getTagUrl,
	pathsEqual,
	removeFileExtension,
	url,
} from "./url-utils";

describe("removeFileExtension", () => {
	it("removes markdown extensions", () => {
		expect(removeFileExtension("posts/guide/index.md")).toBe("posts/guide/index");
		expect(removeFileExtension("posts/article.mdx")).toBe("posts/article");
		expect(removeFileExtension("posts/old.markdown")).toBe("posts/old");
	});

	it("leaves paths without markdown extension unchanged", () => {
		expect(removeFileExtension("posts/guide/index")).toBe("posts/guide/index");
		expect(removeFileExtension("assets/image.png")).toBe("assets/image.png");
	});
});

describe("pathsEqual", () => {
	it("compares paths case-insensitively ignoring leading/trailing slashes", () => {
		expect(pathsEqual("/posts/hello/", "posts/hello")).toBe(true);
		expect(pathsEqual("POSTS/HELLO", "posts/hello")).toBe(true);
	});

	it("returns false for different paths", () => {
		expect(pathsEqual("/posts/hello", "/posts/world")).toBe(false);
	});
});

describe("getPostUrlBySlug", () => {
	it("returns a normalized post url and strips markdown extension", () => {
		expect(getPostUrlBySlug("hello.md")).toBe("/posts/hello/");
	});
});

describe("getPostUrlByAlias", () => {
	it("returns a normalized url under /posts/", () => {
		expect(getPostUrlByAlias("/custom-alias/")).toBe("/posts/custom-alias/");
	});
});

describe("getTagUrl", () => {
	it("returns archive url for empty tag", () => {
		expect(getTagUrl("")).toBe("/archive/");
	});

	it("encodes tag in query string", () => {
		expect(getTagUrl("hello world")).toBe("/archive/?tag=hello%20world");
	});
});

describe("getCategoryUrl", () => {
	it("returns uncategorized url for empty category", () => {
		expect(getCategoryUrl("")).toBe("/archive/?uncategorized=true");
	});

	it("encodes category in query string", () => {
		expect(getCategoryUrl("Tech")).toBe("/archive/?category=Tech");
	});
});

describe("getDir", () => {
	it("returns the directory portion of a path", () => {
		expect(getDir("posts/guide/index.md")).toBe("posts/guide/");
	});

	it("returns root slash for paths without a slash", () => {
		expect(getDir("article.md")).toBe("/");
	});
});

describe("getFileDirFromPath", () => {
	it("strips src prefix and file name", () => {
		expect(getFileDirFromPath("src/components/widgets/music-player/types.ts")).toBe(
			"components/widgets/music-player",
		);
	});
});

describe("url", () => {
	it("joins base url with a path", () => {
		expect(url("/posts/hello/")).toBe("/posts/hello/");
	});
});
