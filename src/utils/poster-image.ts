/**
 * 文章海报/封面图解析工具
 * 在构建期把 frontmatter 中的图片路径解析成可直接渲染的 src：本地图片走 import.meta.glob 拿哈希后的地址，远程图片转成 base64 内联。
 * 之所以内联远程图，是为了让 OG 图/海报在离线或防盗链场景下仍可用。
 */
/** 解析文章图片路径，返回最终可用的图片地址；解析失败时原样返回 */
export async function processPosterImage(
	imagePath: string | undefined,
	filePath: string | undefined,
): Promise<string> {
	if (!imagePath) {
		return "";
	}

	// 不以 /、http(s)、data: 开头的视为相对于文章所在目录的本地图片
	const isLocal = !(
		imagePath.startsWith("/") ||
		imagePath.startsWith("http") ||
		imagePath.startsWith("https") ||
		imagePath.startsWith("data:")
	);

	if (isLocal && filePath) {
		const basePath = filePath.replace(/\/[^/]+$/, "").replace(/\\/g, "/");
		const files = import.meta.glob<ImageMetadata>(
			"../../**/*.{jpg,jpeg,png,gif,webp,avif,svg}",
			{
				import: "default",
			},
		);
		// 使用字符串操作替代 path.normalize 和 path.join
		const normalizedPath = normalizePath(`../../${basePath}/${imagePath}`);
		const file = files[`./${normalizedPath}`] || files[normalizedPath];
		if (file) {
			const img = await file();
			return img.src;
		}
	}

	if (imagePath.startsWith("http")) {
		try {
			const response = await fetch(imagePath);
			const arrayBuffer = await response.arrayBuffer();
			const base64 = btoa(
				String.fromCharCode(...new Uint8Array(arrayBuffer)),
			);
			const contentType =
				response.headers.get("content-type") || "image/jpeg";
			return `data:${contentType};base64,${base64}`;
		} catch {
			return imagePath;
		}
	}

	return imagePath;
}

// 简单的路径规范化函数，替代 path.normalize
/** 规范化相对路径：统一分隔符并消解 . 与 ..，保证能与 glob 的 key 匹配 */
function normalizePath(path: string): string {
	// 将反斜杠替换为正斜杠
	path = path.replace(/\\/g, "/");

	// 处理 ../ 和 ./
	// 遇到 .. 时弹出上一级目录，从而在纯字符串层面完成路径消解
	const parts = path.split("/");
	const result: string[] = [];

	for (const part of parts) {
		if (
			part === ".." &&
			result.length > 0 &&
			result[result.length - 1] !== ".."
		) {
			result.pop();
		} else if (part !== "." && part !== "") {
			result.push(part);
		}
	}

	// 保留开头的 ../
	const prefixParts: string[] = [];
	for (const part of parts) {
		if (part === "..") {
			prefixParts.push(part);
		} else if (part !== "." && part !== "") {
			break;
		}
	}

	return [...prefixParts, ...result].join("/");
}
