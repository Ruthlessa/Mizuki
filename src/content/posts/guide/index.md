---
title: Mizuki 使用指南
published: 2024-04-01
description: "如何使用这个博客模板。"
tags: ["Mizuki", "博客", "自定义"]
category: 指南
draft: false
---



这个博客模板是使用 [Astro](https://astro.build/) 构建的。对于本指南中未提及的内容，你可以在 [Astro 文档](https://docs.astro.build/) 中找到答案。

## 文章前置元数据

```yaml
---
title: 我的第一篇博客文章
published: 2023-09-09
description: 这是我的新 Astro 博客的第一篇文章。
image: ./cover.jpg
tags: [示例, 标签]
category: 前端
draft: false
---
```




| 属性 | 描述 |
|------|------|
| `title` | 文章标题。 |
| `published` | 文章发布日期。 |
| `pinned` | 文章是否固定在文章列表顶部。 |
| `priority` | 固定文章的优先级。值越小优先级越高 (0, 1, 2...)。 |
| `description` | 文章的简短描述。显示在首页。 |
| `image` | 文章的封面图片路径。<br/>1. 以 `http://` 或 `https://` 开头：使用网络图片<br/>2. 以 `/` 开头：使用 `public` 目录中的图片<br/>3. 无前缀：相对于 Markdown 文件的路径 |
| `tags` | 文章的标签。 |
| `category` | 文章的分类。 |
| `licenseName` | 文章内容的许可证名称。 |
| `author` | 文章的作者。 |
| `sourceLink` | 文章内容的源链接或参考。 |
| `draft` | 文章是否为草稿，草稿不会显示。 |

## 文章文件的放置位置



你的文章文件应该放在 `src/content/posts/` 目录中。你也可以创建子目录来更好地组织你的文章和资产。

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.webp
    └── index.md
```