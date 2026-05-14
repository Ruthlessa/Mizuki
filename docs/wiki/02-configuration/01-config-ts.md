# config.ts

## 配置概述

`src/config.ts` 是主题的主配置文件，包含网站的所有核心配置项。

## 站点配置

### 基础信息

```typescript
export const siteConfig = {
  title: 'My Blog',
  subtitle: 'A modern blog theme',
  description: 'Welcome to my blog',
  lang: 'zh_CN',
  timezone: 'Asia/Shanghai',
}
```

### 导航栏配置

```typescript
navbarTitle: {
  mode: 'text' | 'logo',
  text: 'Mizuki',
  logo: '/assets/logo.png',
  icon: '/assets/favicon.ico',
}
```

### 主题配置

```typescript
themeColor: {
  fixed: false,
  default: 'auto',
  options: ['light', 'dark', 'auto'],
}
```

### 页面配置

```typescript
postListLayout: {
  defaultMode: 'grid' | 'list',
  switchable: true,
}
```

### 评论系统

```typescript
comment: {
  provider: 'twikoo' | 'giscus' | false,
  twikoo: {
    url: 'https://your-twikoo-server.com',
  },
  giscus: {
    repo: 'username/repo',
    repoId: 'your-repo-id',
    category: 'Comments',
    categoryId: 'your-category-id',
  },
}
```

### 搜索配置

```typescript
search: {
  enabled: true,
  provider: 'pagefind',
}
```

### TOC 配置

```typescript
toc: {
  enable: true,
  depth: 3,
  mobileTop: true,
}
```

### 壁纸模式

```typescript
wallpaperMode: {
  enable: true,
  showModeSwitchOnMobile: 'desktop' | 'mobile' | 'both' | 'off',
}
```

## 导航链接配置

```typescript
export const navBarConfig = {
  links: [
    {
      name: '首页',
      href: '/',
      icon: 'material-symbols:home',
    },
    {
      name: '文章',
      href: '/posts/',
      icon: 'material-symbols:article',
      children: [
        {
          name: '技术',
          href: '/posts/category/tech/',
        },
      ],
    },
  ],
}
```

## 链接预设

```typescript
export const LinkPresets = {
  [LinkPreset.Home]: {
    name: '首页',
    href: '/',
    icon: 'material-symbols:home',
  },
  [LinkPreset.Posts]: {
    name: '文章',
    href: '/posts/',
    icon: 'material-symbols:article',
  },
}
```

## 类型定义

### NavBarLink

```typescript
interface NavBarLink {
  name: string;
  href: string;
  icon?: string;
  children?: NavBarLink[];
  target?: string;
  rel?: string;
}
```

### SiteConfig

```typescript
interface SiteConfig {
  title: string;
  subtitle?: string;
  description: string;
  lang: string;
  timezone: string;
  navbarTitle: NavbarTitleConfig;
  themeColor: ThemeColorConfig;
  comment: CommentConfig;
  search: SearchConfig;
  toc: TocConfig;
  wallpaperMode: WallpaperModeConfig;
  postListLayout: PostListLayoutConfig;
  banner?: BannerConfig;
}
```

## 配置建议

1. **生产环境**: 将敏感配置（如 API 密钥）放在环境变量中
2. **开发环境**: 使用默认配置即可
3. **多语言**: 根据需要设置 `lang` 和 `timezone`
4. **性能优化**: 合理配置图片和资源路径

## 常见问题

### 配置不生效

确保修改配置后重新启动开发服务器：

```bash
pnpm dev
```

### 图标不显示

检查图标名称是否正确，确保使用的是 Material Symbols 图标名称。

### 评论系统不工作

检查评论服务端配置是否正确，确保服务端可以正常访问。