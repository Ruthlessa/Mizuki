# 文章概述

## 文章体系架构

项目采用 Astro Content Collections 管理文章内容，支持以下特性：

- Markdown / MDX 支持
- 分类系统
- 标签系统
- 加密文章
- 草稿功能
- 阅读时间统计
- 字数统计

## 文章结构

### 单文件结构

直接在 `src/content/posts/` 目录下创建 `.md` 文件：

```
src/content/posts/
├── my-first-post.md
└── another-post.md
```

### 文件夹结构

对于包含资源的文章，使用文件夹结构：

```
src/content/posts/
├── my-post/
│   ├── index.md
│   └── images/
│       └── screenshot.webp
└── guide/
    ├── index.md
    └── cover.webp
```

## 文章元数据

### 基础元数据

```markdown
---
title: '文章标题'
date: '2024-01-01'
lastModified: '2024-01-15'
description: '文章描述'
category: 'Tech'
tags: ['JavaScript', 'TypeScript']
draft: false
encrypted: false
readingTime: 10
---
```

### 元数据字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| date | string | 是 | 发布日期 |
| lastModified | string | 否 | 最后修改日期 |
| description | string | 否 | 文章描述 |
| category | string | 否 | 分类名称 |
| tags | string[] | 否 | 标签数组 |
| draft | boolean | 否 | 是否为草稿 |
| encrypted | boolean | 否 | 是否加密 |
| readingTime | number | 否 | 阅读时间（分钟） |

### 加密文章

```markdown
---
title: '私密文章'
date: '2024-01-01'
encrypted: true
---

文章内容需要密码才能查看。
```

### 草稿文章

```markdown
---
title: '草稿文章'
date: '2024-01-01'
draft: true
---

草稿文章不会在生产环境显示。
```

## 分类系统

### 创建分类

在文章元数据中设置 `category` 字段：

```markdown
---
category: '技术'
---
```

### 分类页面

分类页面自动生成，访问 `/posts/category/{category}/` 查看。

## 标签系统

### 添加标签

在文章元数据中设置 `tags` 字段：

```markdown
---
tags: ['JavaScript', 'React', '前端']
---
```

### 标签页面

标签页面自动生成，访问 `/posts/tag/{tag}/` 查看。

## 文章列表

### 分页支持

文章列表支持分页，每页显示指定数量的文章。

### 排序方式

支持按日期排序：
- 最新发布在前
- 按分类过滤
- 按标签过滤

## 阅读时间

阅读时间自动计算，基于文章字数和平均阅读速度（每分钟 300 字）。

### 手动设置

```markdown
---
readingTime: 15
---
```

## 字数统计

字数统计自动计算，显示在文章底部。

## MDX 支持

### 启用 MDX

在 `src/content/config.ts` 中配置：

```typescript
export const collections = {
  posts: defineCollection({
    schema: ({ z }) => z.object({
      // ...
    }),
  }),
};
```

### 使用组件

在 MDX 文章中使用组件：

```mdx
---
title: 'MDX 示例'
---

<MyCustomComponent />

文章内容...
```

### 注意事项

- MDX 组件需要在客户端渲染
- 使用 `client:only` 指令
- 确保组件已正确导出

## 图片处理

### 图片路径

使用相对路径引用图片：

```markdown
![图片描述](./images/screenshot.webp)
```

### 图片优化

- 自动转换为 WebP 格式
- 支持响应式图片
- 自动懒加载

## 代码高亮

### 基本语法

使用三个反引号包裹代码：

```markdown
```javascript
console.log('Hello World');
```
```

### 指定语言

```markdown
```typescript
const message: string = 'Hello';
```
```

### 代码块选项

支持以下选项：
- 行号显示
- 语法高亮
- 复制按钮
- 代码折叠

## 文章模板

### 模板生成

使用脚本创建新文章：

```bash
pnpm new-post "文章标题"
```

### 模板内容

```markdown
---
title: '{{ title }}'
date: '{{ date }}'
description: ''
category: ''
tags: []
draft: true
---

## 介绍

文章内容...
```

## 性能优化

### 懒加载

图片和代码块自动懒加载。

### 代码分割

文章内容按需加载。

### 缓存策略

- 静态资源缓存
- CDN 支持
- 版本控制