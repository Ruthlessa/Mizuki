#!/usr/bin/env node

/**
 * analyze-bundle.js
 * 
 * 分析构建后的 bundle 大小和资源加载情况
 * 使用方法: npm run analyze-bundle 或 pnpm run analyze-bundle
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "../dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");

// 颜色输出
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	cyan: "\x1b[36m",
	dim: "\x1b[2m",
};

function formatBytes(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileSizeInBytes(filePath) {
	try {
		return fs.statSync(filePath).size;
	} catch {
		return 0;
	}
}

function analyzeDirectory(dir, pattern) {
	const files = [];
	if (!fs.existsSync(dir)) return files;

	const items = fs.readdirSync(dir);
	for (const item of items) {
		const filePath = path.join(dir, item);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			files.push(...analyzeDirectory(filePath, pattern));
		} else if (!pattern || pattern.test(item)) {
			files.push({
				name: path.relative(DIST_DIR, filePath),
				size: stat.size,
			});
		}
	}
	return files;
}

function main() {
	console.log(`\n${colors.bright}${colors.cyan}📦 Bundle 分析报告${colors.reset}\n`);

	if (!fs.existsSync(DIST_DIR)) {
		console.log(`${colors.red}❌ dist 目录不存在，请先运行 npm run build${colors.reset}\n`);
		process.exit(1);
	}

	// 分析 JavaScript
	console.log(`${colors.bright}JavaScript 文件:${colors.reset}`);
	const jsFiles = analyzeDirectory(ASSETS_DIR, /\.js$/);
	let totalJs = 0;
	jsFiles.sort((a, b) => b.size - a.size).slice(0, 10).forEach((file) => {
		totalJs += file.size;
		const sizeStr = formatBytes(file.size);
		console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
	});
	if (jsFiles.length > 10) {
		console.log(`  ${colors.dim}... 和其他 ${jsFiles.length - 10} 个文件${colors.reset}`);
	}

	// 分析 CSS
	console.log(`\n${colors.bright}CSS 文件:${colors.reset}`);
	const cssFiles = analyzeDirectory(ASSETS_DIR, /\.css$/);
	let totalCss = 0;
	cssFiles.forEach((file) => {
		totalCss += file.size;
		const sizeStr = formatBytes(file.size);
		console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
	});

	// 分析字体
	console.log(`\n${colors.bright}字体文件:${colors.reset}`);
	const fontFiles = analyzeDirectory(ASSETS_DIR, /\.(ttf|woff|woff2|otf)$/);
	let totalFonts = 0;
	fontFiles.forEach((file) => {
		totalFonts += file.size;
		const sizeStr = formatBytes(file.size);
		console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
	});

	// 分析图片
	console.log(`\n${colors.bright}图片文件:${colors.reset}`);
	const imageFiles = analyzeDirectory(ASSETS_DIR, /\.(png|jpg|jpeg|gif|svg|webp)$/);
	let totalImages = 0;
	imageFiles.sort((a, b) => b.size - a.size).slice(0, 10).forEach((file) => {
		totalImages += file.size;
		const sizeStr = formatBytes(file.size);
		console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
	});
	if (imageFiles.length > 10) {
		console.log(`  ${colors.dim}... 和其他 ${imageFiles.length - 10} 个文件${colors.reset}`);
	}

	// 总结
	const allFiles = analyzeDirectory(DIST_DIR, null);
	const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

	console.log(`\n${colors.bright}总体统计:${colors.reset}`);
	console.log(`  JavaScript: ${colors.yellow}${formatBytes(totalJs).padStart(10)}${colors.reset}`);
	console.log(`  CSS:        ${colors.yellow}${formatBytes(totalCss).padStart(10)}${colors.reset}`);
	console.log(`   字体:       ${colors.yellow}${formatBytes(totalFonts).padStart(10)}${colors.reset}`);
	console.log(`   图片:       ${colors.yellow}${formatBytes(totalImages).padStart(10)}${colors.reset}`);
	console.log(`  总大小:     ${colors.bright}${formatBytes(totalSize).padStart(10)}${colors.reset}`);
	console.log(`  文件数:     ${colors.cyan}${allFiles.length.toString().padStart(10)}${colors.reset}\n`);

	// 建议
	console.log(`${colors.bright}优化建议:${colors.reset}`);
	if (totalJs > 300 * 1024) {
		console.log(`  ${colors.yellow}⚠️  JavaScript 文件过大 (>${formatBytes(300 * 1024)})，考虑使用代码分割${colors.reset}`);
	}
	if (totalCss > 50 * 1024) {
		console.log(`  ${colors.yellow}⚠️  CSS 文件过大 (>${formatBytes(50 * 1024)})，考虑检查未使用的样式${colors.reset}`);
	}
	if (totalImages > 500 * 1024) {
		console.log(`  ${colors.yellow}⚠️  图片资源过大 (>${formatBytes(500 * 1024)})，考虑压缩或使用 WebP 格式${colors.reset}`);
	}
	console.log("");
}

main();
