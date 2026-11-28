// 压缩 public 下的图片资源：限制最大边长 1600px，webp 质量 80
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOTS = ["/workspace/public/images", "/workspace/public/assets"];
const SKIP_DIRS = ["music", "font"];
const EXTS = new Set([".webp", ".jpg", ".jpeg", ".png"]);
const MAX_EDGE = 1600;
const QUALITY = 80;

const files = [];
function walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (SKIP_DIRS.includes(e.name)) continue;
			walk(p);
		} else if (EXTS.has(path.extname(e.name).toLowerCase())) {
			files.push(p);
		}
	}
}
for (const r of ROOTS) if (fs.existsSync(r)) walk(r);

let before = 0;
let after = 0;
let changed = 0;
let skipped = 0;

for (const file of files) {
	const orig = fs.statSync(file).size;
	before += orig;
	try {
		const img = sharp(file, { failOn: "none" });
		const meta = await img.metadata();
		const ext = path.extname(file).toLowerCase();
		let pipeline = img.resize({
			width: MAX_EDGE,
			height: MAX_EDGE,
			fit: "inside",
			withoutEnlargement: true,
		});
		if (ext === ".webp") pipeline = pipeline.webp({ quality: QUALITY, effort: 5 });
		else if (ext === ".jpg" || ext === ".jpeg") pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
		else pipeline = pipeline.png({ compressionLevel: 9, quality: QUALITY });

		const buf = await pipeline.toBuffer();
		const needResize =
			(meta.width ?? 0) > MAX_EDGE || (meta.height ?? 0) > MAX_EDGE;
		if (buf.length < orig * 0.95 || needResize) {
			fs.writeFileSync(file, buf);
			after += buf.length;
			changed++;
		} else {
			after += orig;
			skipped++;
		}
	} catch (e) {
		after += orig;
		skipped++;
		console.error("skip", file, e.message);
	}
}

const mb = (n) => (n / 1048576).toFixed(1) + "MB";
console.log(
	`files=${files.length} changed=${changed} skipped=${skipped} ${mb(before)} -> ${mb(after)} (-${(100 - (after / before) * 100).toFixed(1)}%)`,
);
