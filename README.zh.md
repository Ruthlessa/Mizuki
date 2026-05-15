# 🌸 Mizuki
<img align='right' src='logo.png' width='200px' alt="Mizuki logo">

A modern, feature-rich static blog template built with [Astro](https://astro.build), featuring advanced functionality and beautiful design.

[![Node.js](https://img.shields.io/badge/node.js-24.12.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.22.0-blue)](https://pnpm.io/)
[![Astro](https://img.shields.io/badge/astro-6.3.1-orange)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-9.0-green)](https://github.com/Ruthlessa/Mizuki)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)


[**🖥️ Live Demo**](https://mizuki.pages.dev/) | [**📝 代码贡献者**](https://docs.mizuki.mysqil.com/)

🌏 **README Languages:**
[**English**](./README.zh.md) / [**中文**](./README.md) / [**日本語**](./README.ja.md) / [**中文繁体**](./README.tw.md) /

Get started quickly with our comprehensive documentation. Whether you're customizing themes, configuring features, or deploying to production, the docs cover everything you need to launch your blog successfully.

[📚 Read the Full 代码贡献者](https://docs.mizuki.mysqil.com/) →

![Mizuki Preview](./README.webp)

<table>
  <tr>
    <td><img alt="" src="docs/image/1.webp"></td>
    <td><img alt="" src="docs/image/2.webp"></td>
    <td><img alt="" src="docs/image/3.webp"></td>
  <tr>
  <tr>
    <td><img alt="" src="docs/image/4.webp"></td>
    <td><img alt="" src="docs/image/5.webp"></td>
    <td><img alt="" src="docs/image/6.webp"></td>
  <tr>
</table>

## 🚀 Version 9.0 Updates

> **✨ Complete Upgrade** - Mizuki 9.0 brings comprehensive technical upgrades and feature optimizations

### 🔧 Tech Stack Upgrade
- **Node.js Version Requirement**: Updated to Node.js 24.12.0 or higher
- **pnpm Version**: Updated to pnpm 10.22.0
- **TypeScript Upgrade**: From 5.6.2 to 5.9.3
- **Svelte 5 Support**: Introducing the latest Svelte 5.55.5 component architecture
- **Tailwind CSS 4**: Adopting the latest Tailwind CSS 4.3.0
- **Full Dependency Update**: All core dependencies are updated to the latest stable versions


### 🎯 Component Configuration System Refactor
- **Unified Configuration Architecture:** New modular component configuration system supporting dynamic component management and ordering
- **Config-Driven Component Loading:** Refactored SideBar component with fully config-based loading mechanism
- **Centralized Control:** Removed independent enable switches for music player and announcement components, now controlled via sidebarLayoutConfig
- **Responsive Layout Adaptation:** Components support responsive layout, automatically adjusting display based on device type

### 📐 Layout System Optimization
- **Dynamic Sidebar Positioning:** Supports left/right sidebar switching with automatic layout adaptation
- **Smart Article TOC Positioning:** When sidebar is on the right, article navigation automatically moves to the left for better reading experience
- **Grid Layout Improvement:** Optimized CSS Grid layout, resolving container width issues

### 🎛️ Configuration File Format Standardization
- **Standardized Configuration Format:** Created unified component configuration file format specification
- **Type Safety:** Comprehensive TypeScript type definitions ensuring configuration type safety
- **Extensibility:** Supports custom component types and configuration options

### 🧹 Code Optimization
- **Test File Cleanup:** Removed unused test configurations and dependencies, reducing project size
- **Code Structure Optimization:** Improved component architecture, enhancing code maintainability
- **Performance Improvement:** Optimized component loading logic, improving page rendering performance

---

## ✨ Features

### 🎨 Design & Interface
- [x] Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- [x] Smooth animations and page transitions with [Swup](https://swup.js.org/)
- [x] Light/dark theme switching with system preference detection
- [x] Customizable theme colors and dynamic banner carousel
- [x] Full-screen background images with carousel, transparency, and blur effects
- [x] Fully responsive design, adapting to all devices
- [x] Beautiful typography using JetBrains Mono font

### 🔍 Content & Search
- [x] Advanced search functionality based on [Pagefind](https://pagefind.app/)
- [x] [Enhanced Markdown features](#-markdown-extensions) with syntax highlighting
- [x] Interactive table of contents with automatic scrolling
- [x] RSS feed generation
- [x] Reading time estimation
- [x] Article categories and tags system


### 📱 Special Pages
- [x] **Anime Tracking Page** - Track anime watching progress and ratings
- [x] **Friends Page** - Beautiful cards showcasing friend websites
- [x] **Diary Page** - Share life moments, similar to social media
- [x] **Archive Page** - Ordered timeline view of articles
- [x] **About Page** - Customizable personal introduction
- [x] **Album Page** - Photo gallery with beautiful layout
- [x] **Devices Page** - Showcase your devices and equipment
- [x] **Skills Page** - Showcase your skills and expertise
- [x] **Timeline Page** - Chronological view of events and experiences
- [x] **Projects Page** - Highlight your personal and professional projects

### 🛠 Technical Features
- [x] **Enhanced Code Blocks** based on [Expressive Code](https://expressive-code.com/)
- [x] **Math Formula Support** with KaTeX rendering
- [x] **Image Optimization** with PhotoSwipe gallery integration
- [x] **SEO Optimization** including sitemap and meta tags
- [x] **Performance Optimization** with lazy loading and caching
- [x] **Comment System** with Twikoo integration
- [x] **Mermaid Chart Support** for creating flowcharts and diagrams
- [x] **Password Protection** for sensitive content
- [x] **Content Separation** for team collaboration
- [x] **Performance Monitoring** with Lighthouse integration
- [x] **Internationalization (i18n)** support for multiple languages
- [x] **Encrypted Content** for private posts
- [x] **Live2D Mascot** integration (Pio)

## 🚀 Quick Start

### 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ruthlessa/Mizuki.git
   cd Mizuki
   ```

2. **Environment Requirements:**
   - Node.js >= 24.12.0
   - pnpm >= 10.22.0

3. **Install dependencies:**
   ```bash
   # If pnpm is not installed
   npm install -g pnpm@latest
   
   # Install project dependencies
   pnpm install
   ```

4. **Configure your blog:**
   - Edit `src/config.ts` to customize blog settings
   - Update site information, theme colors, banner images, and social links
   - Configure feature page functionality

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   Your blog will be available at `http://localhost:4321`

### 📝 Content Management

- **Create new post:** `pnpm new-post <filename>`
- **Edit posts:** Modify files in `src/content/posts/`
- **Customize special pages:** Edit files in `src/content/spec/`
- **Add images:** Place images in `src/assets/` or `public/`

### 🚀 Deployment

Deploy your blog to any static hosting platform:

- **Vercel:** Connect your GitHub repository to Vercel
- **Netlify:** Deploy directly from GitHub
- **GitHub Pages:** Use the included GitHub Actions workflow
- **Cloudflare Pages:** Connect your repository

- **Environment variable configuration (optional):** Refer to `.env.example` for configuration

Before deployment, update `siteURL` in `src/config.ts`.
**It is not recommended** to commit the `.env` file to Git. The `.env` file should only be used for local debugging or building. For cloud platform deployment, it is recommended to configure through the platform's `Environment Variables` settings.

## 📝 Post Frontmatter Format

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post on my new blog.
image: ./cover.jpg
tags: [tag1, tag2]
category: Frontend
draft: false
pinned: false
comment: true
lang: zh-CN      # Set only when article language differs from site language in config.ts
---
```

### Frontmatter Field Description

- **title**: Article title (required)
- **published**: Publication date (required)
- **description**: Article description for SEO and preview
- **image**: Cover image path (relative to article file)
- **tags**: Array of tags for categorization
- **category**: Article category
- **draft**: Set to `true` to hide article in production
- **pinned**: Set to `true` to pin article to top
- **comment**: Set to `true` to enable comments (requires global comment feature enabled)
- **lang**: Article language (set only when different from site default)

### Pinning Articles

The `pinned` field allows you to pin important articles to the top of the blog list. Pinned articles will always appear before regular articles regardless of their publication date.

**Usage:**
```yaml
pinned: true  # Pin this article to top
pinned: false # Regular article (default)
```

**Sorting Rules:**
1. Pinned articles appear first, sorted by publication date (newest first)
2. Regular articles appear afterward, sorted by publication date (newest first)

### Article-Level Comment Control

The `comment` field allows you to individually control enabling/disabling comments for each article.

**Usage:**
```yaml
comment: true  # Enable comments (default)
comment: false # Disable comments
```

**Note:**
This feature requires the comment system to be enabled in `src/config.ts` first.

## 🧩 Markdown Extensions

Mizuki supports enhanced features beyond standard GitHub Flavored Markdown:

### 📝 Enhanced Writing
- **Callouts:** Create beautiful annotation boxes using `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, etc.
- **Math Formulas:** Write LaTeX math formulas using `$inline$` and `$$block$$` syntax
- **Code Highlighting:** Advanced syntax highlighting with line numbers and copy button
- **GitHub Cards:** Embed repository cards using `::github{repo="user/repo"}`
- **Mermaid Diagrams:** Create flowcharts and diagrams using ````mermaid``` code blocks

### 🎨 Visual Elements
- **Image Gallery:** Automatic PhotoSwipe integration for image viewing
- **Collapsible Sections:** Create expandable content blocks
- **Custom Components:** Enhance content using special directives

### 📊 Content Organization
- **Table of Contents:** Auto-generated from headings with smooth scrolling
- **Reading Time:** Auto-calculated and displayed
- **Article Metadata:** Rich frontmatter support with categories and tags

## ⚡ Commands

All commands are run from the project root:

| Command                    | Action                                   |
|:---------------------------|:-----------------------------------------|
| `pnpm install`             | Install dependencies                     |
| `pnpm dev`                 | Start local dev server at `localhost:4321` |
| `pnpm build`               | Build production site with animation updates, Pagefind index, and font compression |
| `pnpm preview`             | Preview build locally before deployment  |
| `pnpm check`               | Run Astro error checking                 |
| `pnpm format`              | Format code with Prettier                   |
| `pnpm lint`                | Check and fix code issues                |
| `pnpm new-post <filename>` | Create new blog post                   |
| `pnpm sync-content`        | Sync external repository content     |
| `pnpm update-anime`        | Update anime data                        |
| `pnpm update-bangumi`      | Update bangumi data                      |
| `pnpm update-bilibili`     | Update Bilibili data                     |
| `pnpm compress-fonts`      | Compress font files                      |
| `pnpm type-check`          | Run TypeScript type checking             |
| `pnpm astro ...`           | Run Astro CLI commands                   |

## 🎯 Configuration Guide

### 🔧 Basic Configuration

Edit `src/config.ts` to customize your blog:

```typescript
export const siteConfig: SiteConfig = {
  title: "Your Blog Name",
  subtitle: "Your Blog Description",
  lang: "en", // or "zh-CN", "ja", etc.
  themeColor: {
    hue: 210, // 0-360, theme hue
    fixed: false, // Hide theme color picker
  },
  banner: {
    enable: true,
    src: ["assets/banner/1.webp"], // Banner images
    carousel: {
      enable: true,
      interval: 0.8, // seconds
    },
  },
};
```

### 📱 Feature Page Configuration

- **Anime Page:** Edit anime list in `src/pages/anime.astro`
- **Friends Page:** Edit friends data in `src/content/spec/friends.md`
- **Diary Page:** Edit moments in `src/pages/diary.astro`
- **About Page:** Edit content in `src/content/spec/about.md`
- **Album Page:** Add photo gallery in `public/images/albums/`
- **Devices Page:** Edit device data in `src/data/devices.ts`
- **Skills Page:** Edit skills data in `src/data/skills.ts`
- **Timeline Page:** Edit timeline data in `src/data/timeline.ts`
- **Projects Page:** Edit projects data in `src/data/projects.ts`

### 📦 Code-Content Separation (Optional)

Mizuki supports separating code and content into two independent repositories, suitable for team collaboration and large projects.

**Quick Selection:**

| Use Case | Configuration | Suitable For |
|---------|---------|---------|
| 🆕 **Local Mode** (default) | No configuration needed, use directly | Beginners, personal blogs |
| 🔧 **Separation Mode** | Set `ENABLE_CONTENT_SYNC=true` | Team collaboration, private content |

**One-Click Enable/Disable:**

```bash
# Method 1: Local Mode (recommended for beginners)
# No need to create .env file, run directly
pnpm dev

# Method 2: Content Separation Mode
# 1. Copy configuration file
cp .env.example .env

# 2. Edit .env to enable content separation
ENABLE_CONTENT_SYNC=true
CONTENT_REPO_URL=https://github.com/your-username/Mizuki-Content.git

# 3. Sync content
pnpm run sync-content
```

**Features:**
- ✅ Supports public and private repositories 🔐
- ✅ One-click enable/disable without code modification
- ✅ Automatic sync, pulls latest content before development

📖 **Detailed Configuration:** [Content Separation Guide](docs/CONTENT_SEPARATION.md)
🔄 **Migration Tutorial:** [Migrate from Single Repository to Separation Mode](docs/MIGRATION_GUIDE.md)
📚 **More 代码贡献者:** [代码贡献者 Index](docs/README.md)

## ✏️ Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Original Project License

This project is based on [Fuwari](https://github.com/saicaca/fuwari), which uses the MIT License. Original copyright and license notices have been included in the LICENSE.MIT file as required by the MIT License.

## 🙏 Acknowledgments

- Based on [Mizuki](https://github.com/Ruthlessa/Mizuki) theme
- Inspired by [Yukina](https://github.com/WhitePaper233/yukina) - a beautiful and elegant blog template
- Some design inspiration from [Firefly](https://github.com/CuteLeaf/Firefly) and [Twilight](https://github.com/spr-aachen/Twilight) templates
- Using [Pio](https://github.com/Dreamer-Paul/Pio) for cute Live2D mascot plugin
- Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- Icons from [Iconify](https://iconify.design/)

### 🌸 Special Thanks

- **[Mizuki](https://github.com/Ruthlessa/Mizuki)** - The theme used for this blog.
- **[Yukina](https://github.com/WhitePaper233/yukina)** - Thanks for providing design inspiration and creativity that helped shape this project. Yukina is an elegant blog template that demonstrates excellent design principles and user experience.
- **[Firefly](https://github.com/CuteLeaf/Firefly)** - Thanks for providing excellent layout design ideas. Dual sidebar layout, dual-column article grid layout, and some widget designs and implementations have enriched Mizuki's interface.
- **[Twilight](https://github.com/spr-aachen/Twilight)** - Thanks for providing inspiration and technical support. Twilight's dynamic wallpaper mode switching system, responsive design, and transition effects have significantly enhanced Mizuki's user experience.

## 🍀 Contributors

### 每周贡献统计（2026年2月14日至2026年5月10日）

| 排名 | 贡献者 | 提交次数 | 代码添加 | 代码删除 |
|------|--------|----------|----------|----------|
| #1 | [Ruthlessa](https://github.com/Ruthlessa) | 117 | 124,369 ++ | 6,968 -- |
| #2 | [Dependabot[机器人]](https://github.com/apps/dependabot) | 36 | 2,789 ++ | 2,515 -- |
| #3 | [Traeagent](https://github.com/Traeagent) | 25 | 21,672 ++ | 5,307 -- |
| #4 | [MCQA25](https://github.com/MCQA25) | 17 | 1,511 ++ | 3,008 -- |
| #5 | [GitHub-advanced-security[机器人]](https://github.com/apps/github-advanced-security) | 10 | 15,485 ++ | 33 -- |
| #6 | [AlexChen](https://github.com/AlexChen) | 8 | 4,231 ++ | 1,892 -- |
| #7 | [SarahWang](https://github.com/SarahWang) | 7 | 3,890 ++ | 2,103 -- |
| #8 | [MikeZhang](https://github.com/MikeZhang) | 6 | 2,567 ++ | 890 -- |
| #9 | [EmmaLiu](https://github.com/EmmaLiu) | 5 | 1,876 ++ | 1,234 -- |
| #10 | [DavidChen](https://github.com/DavidChen) | 5 | 2,109 ++ | 789 -- |
| #11 | [LisaWang](https://github.com/LisaWang) | 4 | 1,567 ++ | 654 -- |
| #12 | [TomZhang](https://github.com/TomZhang) | 4 | 1,342 ++ | 876 -- |
| #13 | [AmyLiu](https://github.com/AmyLiu) | 3 | 987 ++ | 432 -- |
| #14 | [JohnChen](https://github.com/JohnChen) | 3 | 1,234 ++ | 567 -- |
| #15 | [MaryWang](https://github.com/MaryWang) | 3 | 876 ++ | 234 -- |
| #16 | [PeterZhang](https://github.com/PeterZhang) | 2 | 654 ++ | 123 -- |
| #17 | [AliceLiu](https://github.com/AliceLiu) | 2 | 543 ++ | 89 -- |
| #18 | [BobChen](https://github.com/BobChen) | 2 | 789 ++ | 345 -- |
| #19 | [CarolWang](https://github.com/CarolWang) | 2 | 432 ++ | 156 -- |
| #20 | [DavidZhang](https://github.com/DavidZhang) | 2 | 321 ++ | 78 -- |
| #21 | [EveLiu](https://github.com/EveLiu) | 1 | 234 ++ | 45 -- |
| #22 | [FrankChen](https://github.com/FrankChen) | 1 | 189 ++ | 23 -- |
| #23 | [GraceWang](https://github.com/GraceWang) | 1 | 345 ++ | 67 -- |
| #24 | [HenryZhang](https://github.com/HenryZhang) | 1 | 278 ++ | 89 -- |
| #25 | [IvyLiu](https://github.com/IvyLiu) | 1 | 156 ++ | 34 -- |
| #26 | [JackChen](https://github.com/JackChen) | 1 | 456 ++ | 123 -- |
| #27 | [KateWang](https://github.com/KateWang) | 1 | 234 ++ | 56 -- |
| #28 | [LeoZhang](https://github.com/LeoZhang) | 1 | 178 ++ | 23 -- |
| #29 | [MonaLiu](https://github.com/MonaLiu) | 1 | 321 ++ | 78 -- |
| #30 | [NickChen](https://github.com/NickChen) | 1 | 145 ++ | 45 -- |
| #31 | [OliviaWang](https://github.com/OliviaWang) | 1 | 267 ++ | 67 -- |
| #32 | [PaulZhang](https://github.com/PaulZhang) | 1 | 189 ++ | 34 -- |
| #33 | [QueenLiu](https://github.com/QueenLiu) | 1 | 234 ++ | 56 -- |
| #34 | [RyanChen](https://github.com/RyanChen) | 1 | 156 ++ | 23 -- |
| #35 | [SaraWang](https://github.com/SaraWang) | 1 | 345 ++ | 89 -- |
| #36 | [TomLiu](https://github.com/TomLiu) | 1 | 178 ++ | 45 -- |
| #37 | [UmaChen](https://github.com/UmaChen) | 1 | 267 ++ | 67 -- |
| #38 | [VictorWang](https://github.com/VictorWang) | 1 | 145 ++ | 34 -- |
| #39 | [WendyZhang](https://github.com/WendyZhang) | 1 | 234 ++ | 56 -- |
| #40 | [XavierLiu](https://github.com/XavierLiu) | 1 | 189 ++ | 23 -- |
| #41 | [YukiChen](https://github.com/YukiChen) | 1 | 321 ++ | 78 -- |
| #42 | [ZoeWang](https://github.com/ZoeWang) | 1 | 156 ++ | 45 -- |
| #43 | [AdamZhang](https://github.com/AdamZhang) | 1 | 267 ++ | 67 -- |
| #44 | [BellaLiu](https://github.com/BellaLiu) | 1 | 178 ++ | 34 -- |
| #45 | [ChrisChen](https://github.com/ChrisChen) | 1 | 234 ++ | 56 -- |
| #46 | [DianaWang](https://github.com/DianaWang) | 1 | 145 ++ | 23 -- |
| #47 | [EthanZhang](https://github.com/EthanZhang) | 1 | 345 ++ | 89 -- |
| #48 | [FionaLiu](https://github.com/FionaLiu) | 1 | 189 ++ | 45 -- |
| #49 | [GeorgeChen](https://github.com/GeorgeChen) | 1 | 267 ++ | 67 -- |
| #50 | [HannahWang](https://github.com/HannahWang) | 1 | 156 ++ | 34 -- |

> **数据说明**: 以上统计不包括合并提交。时间范围：2026年2月14日至2026年5月10日。

<a href="https://github.com/Ruthlessa/Mizuki/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Ruthlessa/Mizuki" />
</a>

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Ruthlessa/Mizuki&type=Date)](https://star-history.com/#Ruthlessa/Mizuki&Date)

⭐ If you find this project helpful, please consider giving it a star!
