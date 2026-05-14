# 其他配置

## 评论系统配置

### Twikoo

Twikoo 是一个轻量级的评论系统，基于腾讯云开发。

#### 配置步骤

1. **注册腾讯云开发**
2. **创建云开发环境**
3. **部署 Twikoo 服务**
4. **配置前端**

#### 前端配置

在 `src/config.ts` 中配置：

```typescript
comment: {
  provider: 'twikoo',
  twikoo: {
    url: 'https://your-twikoo-server.com',
  },
}
```

#### 功能特性

- 支持 Markdown 格式
- 支持表情评论
- 支持评论通知
- 支持评论管理

### Giscus

Giscus 是基于 GitHub Discussions 的评论系统。

#### 配置步骤

1. **安装 Giscus 应用**
2. **获取仓库 ID**
3. **获取分类 ID**
4. **配置前端**

#### 前端配置

```typescript
comment: {
  provider: 'giscus',
  giscus: {
    repo: 'username/repo',
    repoId: 'your-repo-id',
    category: 'Comments',
    categoryId: 'your-category-id',
    mapping: 'pathname',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'zh-CN',
  },
}
```

## 字体配置

### 自定义字体

在 `src/styles/main.css` 中添加自定义字体：

```css
@font-face {
  font-family: 'MyFont';
  src: url('/assets/fonts/MyFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'MyFont';
  src: url('/assets/fonts/MyFont-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 应用字体

在 Tailwind 配置中设置：

```javascript
theme: {
  fontFamily: {
    sans: ['MyFont', 'sans-serif'],
  },
}
```

### 系统字体栈

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

## 页脚配置

### 页脚内容

在 `src/FooterConfig.html` 中配置页脚 HTML：

```html
<div class="footer-content">
  <p>&copy; 2024 Mizuki. All rights reserved.</p>
  <p>Made with ❤️</p>
</div>
```

### 页脚链接

在 `src/config.ts` 中配置：

```typescript
footer: {
  links: [
    {
      name: 'GitHub',
      href: 'https://github.com/Ruthlessa/Mizuki',
      icon: 'material-symbols:github',
    },
    {
      name: 'RSS',
      href: '/rss.xml',
      icon: 'material-symbols:rss-feed',
    },
  ],
}
```

## Expressive Code 配置

### 代码块主题

```javascript
expressiveCode({
  themes: ['github-dark', 'github-light'],
  defaultTheme: 'github-dark',
  styleOverrides: {
    borderRadius: '0.5rem',
    padding: '1rem',
  },
})
```

### 自定义插件

```javascript
expressiveCode({
  plugins: [
    {
      name: 'my-plugin',
      visitCodeBlock(codeBlock, context) {
        // 自定义处理逻辑
      },
    },
  ],
})
```

### 行号显示

```javascript
expressiveCode({
  showLineNumbers: true,
  lineNumbersFormatter: (lineNumber) => `${lineNumber}.`,
})
```

## 图标配置

### 使用 Astro Icon

```astro
---
import { Icon } from 'astro-icon/components';
---

<Icon name="material-symbols:home" />
```

### 自定义图标

将 SVG 图标放入 `src/assets/icons/` 目录：

```astro
<Icon name="local:my-icon" />
```

### 图标尺寸

```astro
<Icon name="material-symbols:home" class="w-6 h-6" />
```

## 图片优化

### 图片格式

推荐使用 WebP 格式，具有更好的压缩率：

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.png" alt="description" />
</picture>
```

### 懒加载

```html
<img src="image.webp" loading="lazy" alt="description" />
```

### 响应式图片

```html
<img 
  src="image.webp" 
  srcset="image-320.webp 320w, image-640.webp 640w"
  sizes="(max-width: 640px) 320px, 640px"
  alt="description"
/>
```

## SEO 配置

### Meta 标签

在 `src/layouts/partials/HeadTags.astro` 中配置：

```astro
<meta name="description" content={description} />
<meta name="keywords" content={keywords} />
<meta name="author" content={author} />
```

### Open Graph

```astro
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />
<meta property="og:url" content={url} />
```

### Twitter Card

```astro
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
```