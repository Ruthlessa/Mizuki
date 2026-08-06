# 🌸 Mizuki
<img align='right' src='logo.png' width='200px' alt="Mizuki logo">

A modern, feature-rich static blog template built with [Astro](https://astro.build), featuring advanced functionality and beautiful design.

[![Node.js](https://img.shields.io/badge/node.js-24.12.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.22.0-blue)](https://pnpm.io/)
[![Astro](https://img.shields.io/badge/astro-6.3.1-orange)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-9.0-green)](https://github.com/Ruthlessa/Mizuki)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)

[**🖥️ Live Demo**](https://mizuki.pages.dev/) | [**📝 Documentation**](https://docs.mizuki.mysqil.com/)

🌏 **README Languages:**
[**English**](./README.md) · [**中文**](./README.zh.md) · [**日本語**](./README.ja.md) · [**中文繁体**](./README.tw.md)

Get started quickly with our comprehensive documentation. Whether you're customizing themes, configuring features, or deploying to production, the docs cover everything you need.

[📚 Read the Full Documentation](https://docs.mizuki.mysqil.com/) →

![Mizuki Preview](./README.webp)

---

## 🚀 Version 9.0 Updates

> **✨ Complete Upgrade** - Mizuki 9.0 brings comprehensive technical upgrades and feature optimizations

### 🔧 Tech Stack Upgrade
- **Node.js** → 24.12.0+ · **pnpm** → 10.22.0 · **TypeScript** → 5.9.3
- **Svelte 5** component architecture · **Tailwind CSS 4** · All core dependencies updated

### 🎯 Component Configuration System Refactor
- Unified modular component configuration with config-driven SideBar loading
- Centralized control via `sidebarLayoutConfig` (music player, announcements, etc.)
- Responsive layout with automatic device adaptation

### 📐 Layout System Optimization
- Dynamic left/right sidebar switching with auto-layout adaptation
- Smart article TOC positioning · Optimized CSS Grid layout

### 🎛️ Configuration Standardization
- Unified component config format with full TypeScript type safety
- Extensible custom component types

### 🧹 Code Optimization
- Removed unused test configs · Improved component architecture · Better render performance

---

## ✨ Features

### 🎨 Design & Interface
- Built with [Astro](https://astro.build) + [Tailwind CSS](https://tailwindcss.com)
- Smooth page transitions via [Swup](https://swup.js.org/)
- Light/dark theme with system preference detection
- Customizable theme colors, dynamic banner carousel, full-screen wallpapers
- Fully responsive · Beautiful JetBrains Mono typography

### 🔍 Content & Search
- [Pagefind](https://pagefind.app/) powered full-text search
- [Enhanced Markdown](#-markdown-extensions) with syntax highlighting, Mermaid, KaTeX
- Interactive TOC · RSS feeds · Reading time · Tags & categories

### 📱 Special Pages
Anime tracking · Friends · Diary · Archive · About · Albums · Devices · Skills · Timeline · Projects

### 🛠 Technical Features
- [Expressive Code](https://expressive-code.com/) enhanced code blocks
- PhotoSwipe gallery · SEO optimized · Lazy loading · Twikoo comments
- Password-protected content · Content separation · Live2D mascot (Pio)
- i18n (4 languages) · Lighthouse monitoring

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/Ruthlessa/Mizuki.git
cd Mizuki && pnpm install

# 2. Start dev server (Node.js >= 24.12.0, pnpm >= 10.22.0)
pnpm dev   # → http://localhost:4321

# 3. Build for production
pnpm build && pnpm preview
```

**Content:** `pnpm new-post <filename>` creates a new post. Edit posts in `src/content/posts/`.

> 📖 **Full guide:** [docs/wiki/01-getting-started/02-quick-start.md](docs/wiki/01-getting-started/02-quick-start.md)

---

## ⚡ Commands

| Command | Description |
|:--------|:------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build + Pagefind + font compression |
| `pnpm preview` | Preview build locally |
| `pnpm check` | Astro error check |
| `pnpm format` | Prettier format |
| `pnpm lint` | ESLint fix |
| `pnpm new-post <name>` | Create new post |
| `pnpm sync-content` | Sync external content repo |
| `pnpm type-check` | TypeScript type check |

---

## 📚 Documentation

| Topic | Link |
|:------|:-----|
| 🚀 Getting Started | [wiki/01-getting-started](docs/wiki/01-getting-started/) |
| ⚙️ Configuration | [wiki/02-configuration](docs/wiki/02-configuration/) |
| ✍️ Writing Articles | [wiki/03-articles](docs/wiki/03-articles/) |
| 🧩 Markdown Extensions | [wiki/03-articles/02-markdown.md](docs/wiki/03-articles/02-markdown.md) |
| 📝 Post Frontmatter | [wiki/03-articles/01-overview.md](docs/wiki/03-articles/01-overview.md) |
| 📦 Content Separation | [docs/CONTENT_SEPARATION.md](docs/CONTENT_SEPARATION.md) |
| 🚀 Deployment | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| 🛠 Dev Rules & Conventions | [docs/rule](docs/rule/) |
| 📖 All Documentation | [docs/README.md](docs/README.md) |

---

## ✏️ Contributing

Contributions welcome!

1. Fork → 2. Create branch (`git checkout -b feature/amazing-feature`) → 3. Commit → 4. Push → 5. Open PR

## 📄 License

Apache License 2.0 — see [LICENSE](LICENSE). Based on [Fuwari](https://github.com/saicaca/fuwari) (MIT License, see [LICENSE.MIT](LICENSE.MIT)).

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build) · [Tailwind CSS](https://tailwindcss.com) · [Svelte](https://svelte.dev)
- Inspired by [Yukina](https://github.com/WhitePaper233/yukina), [Firefly](https://github.com/CuteLeaf/Firefly), [Twilight](https://github.com/spr-aachen/Twilight)
- Live2D mascot by [Pio](https://github.com/Dreamer-Paul/Pio)
- Icons from [Iconify](https://iconify.design/)

## 🍀 Contributors

<a href="https://github.com/Ruthlessa/Mizuki/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Ruthlessa/Mizuki" />
</a>

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Ruthlessa/Mizuki&type=Date)](https://star-history.com/#Ruthlessa/Mizuki&Date)

⭐ If you find this project helpful, please give it a star!
