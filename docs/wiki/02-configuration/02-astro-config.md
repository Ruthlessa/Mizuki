# astro.config.mjs

## 配置概述

`astro.config.mjs` 是 Astro 框架的核心配置文件，用于配置构建、插件、路由等。

## 基础配置

```javascript
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  base: '/',
  output: 'static',
  integrations: [
    svelte(),
    tailwind(),
    sitemap(),
  ],
});
```

## 关键配置项

### site

网站的基础 URL，用于生成正确的链接和 Sitemap。

```javascript
site: 'https://example.com'
```

### base

网站的基础路径，如果部署在子目录中需要设置。

```javascript
base: '/blog'
```

### output

输出模式，可选值：

- `'static'`: 静态站点生成（推荐）
- `'server'`: 服务端渲染
- `'hybrid'`: 混合模式

```javascript
output: 'static'
```

### integrations

集成的插件列表：

| 插件 | 说明 |
|------|------|
| `@astrojs/svelte` | Svelte 组件支持 |
| `@astrojs/tailwind` | TailwindCSS 支持 |
| `@astrojs/sitemap` | 自动生成 Sitemap |
| `@astrojs/rss` | RSS 订阅支持 |

## 构建配置

### vite

自定义 Vite 配置：

```javascript
vite: {
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-vendor': ['svelte', 'astro-icon'],
          'code-vendor': ['highlight.js', 'mermaid'],
        },
      },
    },
  },
}
```

### compressHTML

是否压缩 HTML 输出：

```javascript
compressHTML: true
```

## 路由配置

### trailingSlash

URL 末尾是否添加斜杠：

```javascript
trailingSlash: 'always' | 'never' | 'ignore'
```

### redirects

自定义重定向规则：

```javascript
redirects: {
  '/old-page': '/new-page',
}
```

## 插件配置

### Expressive Code

代码块高亮配置：

```javascript
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      defaultTheme: 'github-dark',
      styleOverrides: {
        borderRadius: '0.5rem',
      },
    }),
  ],
});
```

### Markdown 插件

```javascript
markdown: {
  remarkPlugins: [
    ['remark-gfm', { singleTilde: false }],
  ],
  rehypePlugins: [
    'rehype-slug',
    'rehype-autolink-headings',
  ],
}
```

## 示例配置

完整的配置示例：

```javascript
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://example.com',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    svelte(),
    tailwind(),
    sitemap(),
    expressiveCode({
      themes: ['github-dark', 'github-light'],
    }),
  ],
  markdown: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug', 'rehype-autolink-headings'],
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
```

## 性能优化

### 代码分割

使用 Vite 的手动代码分割功能：

```javascript
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
}
```

### 资源优化

配置图片和静态资源的处理：

```javascript
vite: {
  assetsInclude: ['**/*.svg', '**/*.webp', '**/*.png'],
}
```

## 常见问题

### 构建失败

检查是否缺少依赖或配置错误：

```bash
pnpm install
pnpm build
```

### 插件冲突

确保插件版本与 Astro 版本兼容。

### 开发服务器端口

自定义开发服务器端口：

```javascript
server: {
  port: 3000,
}
```