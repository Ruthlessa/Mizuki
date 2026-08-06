# Mizuki 主题文档

欢迎使用 Mizuki 主题文档！这是一个基于 Astro 框架的现代化博客主题，提供丰富的功能和灵活的配置选项。

## 📚 文档导航

### 🚀 开始使用

- [项目概述](01-getting-started/01-overview.md) - 了解项目核心功能和技术栈
- [快速开始](01-getting-started/02-quick-start.md) - 环境依赖和项目启动步骤
- [部署指南](01-getting-started/03-deployment.md) - 各大托管平台的部署教程

### ⚙️ 配置指南

- [config.ts 配置详解](02-configuration/01-config-ts.md) - 主题主配置文件
- [astro.config.mjs 配置](02-configuration/02-astro-config.md) - Astro 框架配置
- [其他配置](02-configuration/03-other-config.md) - 评论系统、字体、页脚等
- [页面配置](02-configuration/04-page-config.md) - 各页面的配置方式

### ✍️ 文章编写

- [文章体系架构](03-articles/01-overview.md) - 元数据和内容管理
- [Markdown 语法](03-articles/02-markdown.md) - Markdown 基本语法和扩展
- [私有语法](03-articles/03-private-syntax.md) - 主题自定义语法
- [图表支持](03-articles/04-charts.md) - Mermaid 图表使用指南
- [文章结构](03-articles/05-structure.md) - 文章组织方式和命名规范
- [资源嵌入](03-articles/06-assets.md) - 图片、视频、音乐等资源嵌入
- [内容分离](03-articles/07-content-separation.md) - 代码与内容仓库分离

### 🤝 社区指南

- [提问的艺术](04-guidelines/01-how-to-ask.md) - 如何正确提问和反馈问题

## 📁 文档目录结构

```
docs/wiki/
├── 01-getting-started/          # 🚀 入门指南
│   ├── 01-overview.md          # 项目概述
│   ├── 02-quick-start.md       # 快速开始
│   └── 03-deployment.md         # 部署指南
├── 02-configuration/           # ⚙️ 配置指南
│   ├── 01-config-ts.md        # config.ts 配置
│   ├── 02-astro-config.md     # astro.config.mjs 配置
│   ├── 03-other-config.md     # 其他配置
│   └── 04-page-config.md       # 页面配置
├── 03-articles/                # ✍️ 文章编写
│   ├── 01-overview.md          # 文章概述
│   ├── 02-markdown.md           # Markdown 语法
│   ├── 03-private-syntax.md    # 私有语法
│   ├── 04-charts.md            # 图表
│   ├── 05-structure.md         # 结构
│   ├── 06-assets.md            # 资源嵌入
│   └── 07-content-separation.md # 内容分离
└── 04-guidelines/               # 🤝 社区指南
    └── 01-how-to-ask.md        # 提问的艺术
```

## ✨ 核心功能特性

### 🎨 设计与界面

- **响应式设计** - 完美适配桌面端和移动端
- **暗黑模式** - 支持明暗主题切换，自动跟随系统设置
- **自定义主题** - 可自定义主题颜色和动态横幅轮播
- **全屏壁纸** - 支持背景图片轮播、透明度和模糊效果

### 📝 内容与搜索

- **增强型 Markdown** - 支持语法高亮、Mermaid 图表、数学公式
- **全文搜索** - 基于 Pagefind 的高级搜索功能
- **目录导航** - 交互式目录，支持自动滚动
- **SEO 优化** - 完善的 meta 标签和结构化数据

### 🎵 特色功能

- **音乐播放器** - 内置音乐播放功能，支持播放列表管理
- **相册系统** - 支持图片相册展示，自动优化图片加载
- **评论系统** - 支持 Twikoo 和 Giscus 两种评论系统
- **Live2D 吉祥物** - 可爱的 Pio 插件集成

### 🚀 技术特性

- **高性能** - 使用 Astro 的静态站点生成能力，首屏加载速度快
- **国际化** - 支持中文、英文、日语、繁体中文等多种语言
- **密码保护** - 支持加密内容，用于私人帖子
- **内容分离** - 支持代码与内容仓库分离，便于团队协作

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **框架** | Astro 6.3.1 | 现代化的静态站点生成器 |
| **语言** | TypeScript 5.9.3 | 类型安全的 JavaScript 超集 |
| **样式** | Tailwind CSS 4.3.0 | 实用优先的 CSS 框架 |
| **组件** | Svelte 5.55.5 | 创新的 UI 框架 |
| **构建工具** | Vite | 快速的前端构建工具 |
| **图标** | Material Symbols | Google 材质符号图标库 |
| **动画** | Swup | 页面过渡动画库 |

## 🤝 如何贡献

欢迎为 Mizuki 项目贡献代码和文档！请遵循以下步骤：

1. **Fork 仓库** - 创建您自己的项目分支
2. **创建功能分支** - 使用描述性的分支名称
3. **提交更改** - 编写清晰的提交信息
4. **推送分支** - 将您的更改推送到 GitHub
5. **创建 Pull Request** - 详细描述您的更改内容

## 📖 更多资源

- [主 README 文档](../../README.md) - 项目完整说明
- [部署指南](../DEPLOYMENT.md) - 详细的部署教程
- [内容分离指南](../CONTENT_SEPARATION.md) - 代码与内容分离配置
- [开发规范](../rule/README.md) - 组件开发和代码规范

## ❓ 需要帮助？

- 查看 [GitHub Issues](https://github.com/matsuzaka-yuki/Mizuki/issues) - 提交问题和建议
- 参考 [提问的艺术](04-guidelines/01-how-to-ask.md) - 如何正确提问
- 阅读各模块的详细文档 - 使用上方导航快速定位

---

**🎉 感谢使用 Mizuki！希望这个主题能帮助您创建一个精彩的博客！**