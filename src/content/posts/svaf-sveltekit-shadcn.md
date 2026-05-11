---
title: SVAF - SvelteKit + shadcn-svelte 静态站点生成器
published: 2026-05-11
description: 一个使用 SvelteKit 和 shadcn-svelte UI 组件库的静态站点生成项目，采用 AGPL-3.0 开源协议
tags: ["Svelte", "SvelteKit", "shadcn-svelte", "前端", "静态站点"]
category: "技术"
---

## 项目简介

[SVAF](https://github.com/afoim/svaf) 是一个基于 SvelteKit 和 shadcn-svelte UI 组件库的静态站点生成（SSG）项目。该项目由 [afoim](https://github.com/afoim) 开发，采用现代化的技术栈，为开发者提供了快速构建静态网站的解决方案。

## 技术栈

### 核心框架

- **SvelteKit** - 全栈 Svelte 框架，提供文件系统路由和服务端渲染支持
- **shadcn-svelte** - 高质量的 UI 组件库，基于 Radix UI 和 Svelte
- **Tailwind CSS v4** - 实用优先的 CSS 框架，支持原子化 CSS
- **TypeScript** - 提供完整的类型安全保障

### 设计系统

- **Maia 设计系统** - 集成 Hugeicons 图标库和 Figtree 字体
- **Motion One** - 动画库，为页面添加流畅的入场动画效果

### 部署适配

- **@sveltejs/adapter-static** - 静态适配器，支持纯静态部署
- **wrangler.jsonc** - Cloudflare Workers 配置文件，支持边缘部署

## 核心特性

### 静态站点生成

SVAF 项目配置为完全静态站点生成模式：

- 使用 `@sveltejs/adapter-static` 适配器
- 在 `src/routes/+layout.ts` 中设置 `prerender = true` 和 `ssr = false`
- 构建生成纯静态 HTML/CSS/JS 文件，可部署到任何静态托管服务

### 灵活的组件系统

项目集成了 shadcn-svelte 组件库，可以轻松添加 UI 组件：

```bash
# 添加单个组件
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add card
npx shadcn-svelte@latest add input

# 查看所有可用组件
npx shadcn-svelte@latest add
```

### 动画效果

集成 Motion One 动画库，为网站添加入场动画效果，提升用户体验。

## 项目结构

```
svaf/
├── src/
│ ├── lib/
│ │ ├── components/
│ │ │ └── ui/        # shadcn-svelte 组件
│ │ └── utils/       # 工具函数
│ ├── routes/
│ │ ├── +layout.svelte  # 根布局
│ │ ├── +layout.ts      # SSG 配置
│ │ └── +page.svelte    # 首页
│ └── app.css        # 全局样式
├── scripts/         # 脚本工具
├── vite-plugins/    # Vite 插件
└── static/          # 静态资源
```

## 开发指南

### 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 自动打开浏览器
pnpm dev -- --open
```

### 构建部署

```bash
# 构建静态站点
pnpm build

# 预览构建结果
pnpm preview
```

构建后的静态文件输出到 `build` 目录，可以部署到：

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- 任何静态托管服务

## 配置说明

### 主要配置文件

- `components.json` - shadcn-svelte 组件库配置
- `svelte.config.js` - SvelteKit 配置，使用 adapter-static
- `vite.config.ts` - Vite 构建配置
- `src/routes/+layout.ts` - SSG 模式配置
- `wrangler.jsonc` - Cloudflare Workers 部署配置

### SSG 配置示例

```typescript
// src/routes/+layout.ts
export const prerender = true;
export const ssr = false;
```

## 项目亮点

### 1. 现代化技术栈

采用 SvelteKit 5.x 版本，结合最新的 Tailwind CSS v4，享受前沿技术带来的开发体验。

### 2. 组件化开发

通过 shadcn-svelte 实现组件化开发，可以按需引入组件，控制打包体积。

### 3. 流畅动画

集成 Motion One 动画库，支持页面过渡和元素入场动画，提升用户体验。

### 4. 灵活部署

支持多种部署方式，既可以部署到传统静态托管，也可以部署到边缘计算平台。

### 5. 持续更新

项目保持活跃开发，已有 522+ 次提交，最近仍有功能更新。

## 开源许可

本项目采用 [AGPL-3.0](https://github.com/afoim/svaf/blob/main/LICENSE) 开源协议，允许自由使用和修改，但需要遵守相应的开源条款。

## 总结

SVAF 是一个值得关注的学习和参考项目，它展示了如何使用现代化的 Svelte 生态构建高质量的静态网站。无论是学习 SvelteKit 开发，还是寻找一个新的博客或网站起点，SVAF 都是一个不错的选择。

如果你对 Svelte 和静态站点生成感兴趣，不妨关注 [SVAF 项目](https://github.com/afoim/svaf)，也许能给你带来一些启发！
