# Mizuki 主题文档

欢迎使用 Mizuki 主题文档！这是一个现代化的 Astro 博客主题，提供丰富的功能和灵活的配置选项。

## 快速导航

### 开始使用

- [概述](01-getting-started/01-overview.md) - 了解项目的核心功能和技术栈
- [快速开始](01-getting-started/02-quick-start.md) - 环境依赖和项目启动步骤
- [部署](01-getting-started/03-deployment.md) - 各大托管平台的部署教程

### 配置指南

- [config.ts](02-configuration/01-config-ts.md) - 主题主配置文件详解
- [astro.config.mjs](02-configuration/02-astro-config.md) - Astro 框架配置
- [其他配置](02-configuration/03-other-config.md) - 评论系统、字体、页脚等配置
- [页面配置](02-configuration/04-page-config.md) - 各页面的配置方式

### 文章编写

- [概述](03-articles/01-overview.md) - 文章体系架构和元数据
- [Markdown](03-articles/02-markdown.md) - Markdown 基本语法和扩展
- [私有语法](03-articles/03-private-syntax.md) - 主题自定义语法
- [图表](03-articles/04-charts.md) - Mermaid 图表使用指南
- [结构](03-articles/05-structure.md) - 文章组织方式和命名规范
- [资源嵌入](03-articles/06-assets.md) - 图片、视频、音乐等资源嵌入
- [内容分离](03-articles/07-content-separation.md) - 代码仓库与内容仓库分离

### 社区指南

- [提问的艺术](04-guidelines/01-how-to-ask.md) - 如何正确提问和反馈问题

## 目录结构

```
docs/wiki/
├── 01-getting-started/      # 入门指南
│   ├── 01-overview.md       # 项目概述
│   ├── 02-quick-start.md    # 快速开始
│   └── 03-deployment.md     # 部署指南
├── 02-configuration/        # 配置指南
│   ├── 01-config-ts.md      # config.ts 配置
│   ├── 02-astro-config.md   # astro.config.mjs 配置
│   ├── 03-other-config.md   # 其他配置
│   └── 04-page-config.md    # 页面配置
├── 03-articles/             # 文章编写
│   ├── 01-overview.md       # 文章概述
│   ├── 02-markdown.md       # Markdown 语法
│   ├── 03-private-syntax.md # 私有语法
│   ├── 04-charts.md         # 图表
│   ├── 05-structure.md      # 结构
│   ├── 06-assets.md         # 资源嵌入
│   └── 07-content-separation.md # 内容分离
└── 04-guidelines/           # 社区指南
    └── 01-how-to-ask.md     # 提问的艺术
```

## 核心功能

### 响应式设计
完美适配桌面端和移动端，提供流畅的用户体验。

### 多语言支持
支持中文、英文、日语、繁体中文等多种语言。

### 暗黑模式
内置明暗主题切换，自动跟随系统设置。

### 音乐播放器
内置音乐播放功能，支持播放列表管理。

### 相册系统
支持图片相册展示，自动优化图片加载。

### 评论系统
支持 Twikoo 和 Giscus 两种评论系统。

### 全文搜索
集成 Pagefind 全文搜索功能。

### 性能优化
使用 Astro 的静态站点生成能力，首屏加载速度快。

## 技术栈

- **框架**: Astro 4.x
- **语言**: TypeScript
- **样式**: TailwindCSS 3
- **组件**: Svelte
- **图标**: Material Symbols
- **动画**: CSS Animations

## 贡献

欢迎贡献代码和文档！请阅读 [贡献指南](04-guidelines/01-how-to-ask.md) 了解如何参与。

## 许可证

MIT License