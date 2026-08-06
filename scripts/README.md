# Mizuki 脚本工具文档

`scripts/` 目录下包含一系列辅助脚本，用于内容管理、数据同步、构建优化和性能监控。所有脚本通过 `pnpm` 命令调用，无需手动执行 `node scripts/xxx.js`。

## 快速索引

| pnpm 命令 | 脚本文件 | 用途 |
|-----------|----------|------|
| `pnpm new-post <name>` | `new-post.js` | 创建新博客文章 |
| `pnpm sync-content` | `sync-content.js` | 从外部仓库同步内容 |
| `pnpm init-content` | `init-content-repo.js` | 初始化代码-内容分离的内容仓库 |
| `pnpm update-anime` | `update-anime.mjs` | 更新本地番剧数据 JSON |
| `pnpm update-bangumi` | `update-bangumi.mjs` | 从 Bangumi API 拉取观看进度 |
| `pnpm update-bilibili` | `update-bilibili.mjs` | 从 Bilibili API 拉取观看进度 |
| `pnpm convert-images` | `convert-images.js` | 批量转换图片格式和压缩 |
| `pnpm compress-fonts` | `compress-fonts.js` | 字体子集化压缩（减小体积） |
| `pnpm optimize` | `optimize-all.js` | 一键执行所有优化（图片 + 字体） |
| `pnpm submit` | `indexnow-submit.js` | 提交 sitemap 到 IndexNow 搜索引擎 |
| `pnpm performance:baseline` | `performance-baseline.js` | 写入性能基准值 |
| `pnpm performance:check` | `performance-check.js` | 对比当前性能与基准，检测回归 |
| `pnpm analyze-bundle` | `analyze-bundle.js` | 分析构建产物包体积 |
| — | `fetch-album-images.mjs` | 从 URL 列表批量下载相册图片 |
| — | `load-env.js` | `.env` 文件加载工具（内部使用） |

---

## 内容管理

### `pnpm new-post <filename>`

创建一篇新的博客文章，写入 `src/content/posts/` 目录。自动生成 frontmatter 模板（标题、日期、标签等）。

```bash
pnpm new-post my-new-post
# → src/content/posts/my-new-post.md
```

### `pnpm sync-content`

当开启 **代码-内容分离模式** 时，从外部 Git 仓库拉取最新内容。

| 环境变量 | 必填 | 说明 |
|----------|------|------|
| `ENABLE_CONTENT_SYNC` | 否 | 设为 `false` 可在开发时临时关闭，默认开启 |
| `CONTENT_REPO_URL` | 分离模式必填 | 内容仓库 Git URL |
| `CONTENT_DIR` | 否 | 内容同步目录，默认 `content/` |

该脚本会被 `predev` 和 `prebuild` 自动触发。

### `pnpm init-content`

初始化一个符合 Mizuki 结构的内容仓库。生成推荐的目录骨架，适合初次搭建分离模式的用户。

---

## 数据同步（特色页面）

### `pnpm update-bangumi`

从 [Bangumi API](https://api.bgm.tv) 拉取指定用户的动画观看进度，写入 `src/data/anime.ts`。

```typescript
// src/config.ts 中配置
bangumi: {
  userId: "your-bangumi-id",
  fetchOnDev: false,  // 开发环境是否也拉取
}
anime: { mode: "bangumi" }  // 切换番剧数据源
```

### `pnpm update-bilibili`

从 Bilibili API 拉取视频观看进度，写入本地 JSON 文件。

```typescript
// src/config.ts 中配置
bilibili: {
  vmid: "your-bilibili-vmid",
  fetchOnDev: false,
  coverMirror: "",  // 封面镜像源
  useWebp: true,
}
anime: { mode: "bilibili" }
```

| 环境变量 | 说明 |
|----------|------|
| `BILI_SESSDATA` | B 站登录凭证（用于获取观看进度）。**不要硬编码到 .env 提交到 Git**。 |

### `pnpm update-anime`

**本地模式**下使用。当 `anime.mode === "local"` 时，此脚本仅做构建前的动画数据 JSON 准备，不调用外部 API。

### `fetch-album-images.mjs`（无 pnpm 命令）

独立脚本，从 URL 列表批量下载图片到本地相册目录，附带 Sharp 压缩。需要手动执行：

```bash
node scripts/fetch-album-images.mjs
```

---

## 构建优化

### `pnpm convert-images`

使用 [Sharp](https://sharp.pixelplumbing.com/) 批量转换 `public/images/` 下的图片为 WebP/AVIF 格式并压缩。建议在部署前执行。

### `pnpm compress-fonts`

使用 [Fontmin](https://github.com/ecomfe/fontmin) 对 TTF 字体进行子集化。只保留实际使用的字符（ASCII + CJK 常用字），显著减小字体文件体积。

```typescript
// src/config.ts 中的字体配置决定行为
font: {
  asciiFont: { enableCompress: true },
  cjkFont:   { enableCompress: true },
}
```

> ⚠️ 子集化仅在**生产构建**（`pnpm build`）中生效，开发模式下显示浏览器默认字体。

### `pnpm optimize`

一键串联执行 `convert-images` + `compress-fonts`，适合部署前的完整优化。

### `pnpm analyze-bundle`

分析 `dist/` 目录中各模块的包体积，输出 Top N 最大依赖。需先执行 `pnpm build`。

---

## 性能监控

### `pnpm performance:baseline`

将当前 Lighthouse CI 报告写入 `src/config/performance-baseline.json`，作为后续对比基准。

### `pnpm performance:check`

重新运行 Lighthouse CI 并与基准值对比。若任何指标（LCP、CLS、TBT、得分）出现明显回退，会输出警告。

### `pnpm lhci` / `pnpm lighthouse`

直接调用 [LHCI](https://github.com/GoogleChrome/lighthouse-ci) 和 Lighthouse CLI，生成可交互的 HTML 报告。

---

## 搜索引擎提交

### `pnpm submit`

解析 `public/sitemap.xml`，将所有 URL 批量提交到 [IndexNow](https://www.indexnow.org/) 搜索引擎（Bing、百度等）。

| 环境变量 | 说明 |
|----------|------|
| `INDEXNOW_KEY` | IndexNow API Key |
| `INDEXNOW_HOST` | 站点域名（如 `example.com`） |

---

## 辅助脚本

### `load-env.js`

内部模块，负责加载 `.env` 文件中的环境变量。`sync-content.js`、`indexnow-submit.js`、`update-bilibili.mjs` 依赖此模块。

### `pnpm build` 中的脚本串联

实际构建流程如下（由 `pnpm build` 一条命令触发）：

```
prebuild → sync-content.js →
  update-anime.mjs →
  astro build →
  pagefind --site dist →
  compress-fonts.js
```

---

## 环境变量汇总

以下环境变量影响脚本行为，建议在 `.env.example` 基础上创建 `.env`：

| 变量 | 影响脚本 | 默认值 |
|------|----------|--------|
| `ENABLE_CONTENT_SYNC` | sync-content | `true` |
| `CONTENT_REPO_URL` | sync-content, init-content | 空 |
| `CONTENT_DIR` | sync-content | `content` |
| `BILI_SESSDATA` | update-bilibili | — |
| `INDEXNOW_KEY` | indexnow-submit | — |
| `INDEXNOW_HOST` | indexnow-submit | — |

> 🔒 **安全提示**：`.env` 文件包含敏感凭证，已在 `.gitignore` 中排除。**切勿将 `.env` 提交到 Git**。
