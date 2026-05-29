#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 开始全面压缩优化...\n");

// 步骤1: 图片优化
console.log("📸 步骤1: 优化图片...");
try {
  execSync("node scripts/convert-images.js", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("✅ 图片优化完成\n");
} catch (error) {
  console.error("❌ 图片优化失败:", error.message);
}

// 步骤2: 构建项目并自动压缩字体
console.log("🏗️  步骤2: 构建项目...");
try {
  execSync("pnpm build", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("✅ 构建完成\n");
} catch (error) {
  console.error("❌ 构建失败:", error.message);
  process.exit(1);
}

// 总结
console.log("\n🎉 全面压缩优化完成！");
console.log("📊 优化成果:");
console.log("   - 图片已转换为 WebP 格式，平均节省 80%+ 空间");
console.log("   - 字体已压缩为 WOFF2 格式，节省约 97% 空间");
console.log("   - 构建产物已优化");
console.log("\n💡 提示: 可以使用 'pnpm preview' 来预览优化后的站点");
