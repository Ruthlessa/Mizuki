# 结构

## 文章组织方式

### 单文件结构

直接在 `src/content/posts/` 目录下创建 `.md` 文件：

```
src/content/posts/
├── my-first-post.md
├── another-post.md
└── draft-post.md
```

**优点：**
- 简单直接
- 适合短小的文章
- 易于管理

**缺点：**
- 不方便管理相关资源
- 不适合复杂文章

### 文件夹结构

对于包含资源的文章，使用文件夹结构：

```
src/content/posts/
├── my-post/
│   ├── index.md
│   ├── images/
│   │   ├── screenshot1.webp
│   │   └── screenshot2.webp
│   └── attachments/
│       └── document.pdf
└── guide/
    ├── index.md
    └── cover.webp
```

**优点：**
- 资源组织清晰
- 适合复杂文章
- 便于版本控制

**缺点：**
- 结构稍复杂
- 需要额外创建文件夹

## 命名规范

### 文件命名

- 使用小写字母
- 使用连字符 `-` 分隔单词
- 避免使用空格和特殊字符

**推荐：**
```
my-first-post.md
guide-to-markdown.md
2024-01-01-introduction.md
```

**不推荐：**
```
My First Post.md
guide_to_markdown.md
GuideToMarkdown.md
```

### 文件夹命名

遵循相同的命名规范：

```
my-post/
project-documentation/
getting-started/
```

## 目录结构

### 根目录

```
src/content/posts/
├── _index.md          # 可选的索引页
├── category/          # 分类文件夹（可选）
│   └── tech/
│       └── article.md
├── tag/               # 标签文件夹（可选）
│   └── javascript/
│       └── article.md
└── article.md         # 直接放在根目录
```

### 分类组织

按分类组织文章：

```
src/content/posts/
├── tech/
│   ├── javascript.md
│   ├── typescript.md
│   └── react.md
├── life/
│   ├── diary.md
│   └── travel.md
└── about.md
```

### 日期组织

按日期组织文章：

```
src/content/posts/
├── 2024/
│   ├── 01/
│   │   ├── first-post.md
│   │   └── second-post.md
│   └── 02/
│       └── third-post.md
└── 2023/
    └── 12/
        └── old-post.md
```

## 元数据结构

### 基础元数据

```markdown
---
title: '文章标题'
date: '2024-01-01'
description: '文章描述'
category: '技术'
tags: ['JavaScript', 'TypeScript']
draft: false
---
```

### 进阶元数据

```markdown
---
title: '文章标题'
date: '2024-01-01'
lastModified: '2024-01-15'
description: '文章描述'
category: '技术'
tags: ['JavaScript', 'TypeScript']
draft: false
encrypted: false
readingTime: 10
cover: '/images/cover.webp'
author: '作者名称'
series: '系列名称'
---
```

### 字段说明

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
| cover | string | 否 | 封面图片路径 |
| author | string | 否 | 作者名称 |
| series | string | 否 | 系列名称 |

## 内容结构

### 标准结构

```markdown
---
title: '文章标题'
date: '2024-01-01'
---

## 介绍

文章简介...

## 正文

详细内容...

## 结论

总结...

## 参考资料

- [链接1](https://example.com)
- [链接2](https://example.com)
```

### 教程结构

```markdown
---
title: '教程标题'
date: '2024-01-01'
---

## 前提条件

读者需要具备的知识...

## 步骤一

详细步骤...

## 步骤二

详细步骤...

## 步骤三

详细步骤...

## 总结

完成后的效果...
```

### 技术文章结构

```markdown
---
title: '技术文章标题'
date: '2024-01-01'
---

## 概述

技术介绍...

## 原理分析

深入分析...

## 实现代码

```javascript
// 代码示例
```

## 测试验证

测试结果...

## 性能优化

优化建议...
```

## 资源管理

### 图片资源

将图片放在文章文件夹内：

```
my-post/
├── index.md
└── images/
    ├── screenshot.webp
    └── diagram.webp
```

引用方式：

```markdown
![截图](./images/screenshot.webp)
```

### 附件资源

```
my-post/
├── index.md
├── images/
└── attachments/
    ├── document.pdf
    └── data.csv
```

引用方式：

```markdown
[下载文档](./attachments/document.pdf)
```

### 静态资源

全局静态资源放在 `public/` 目录：

```
public/
├── assets/
│   ├── images/
│   └── files/
└── downloads/
    └── guide.pdf
```

引用方式：

```markdown
![全局图片](/assets/images/logo.webp)

[下载指南](/downloads/guide.pdf)
```

## 版本控制

### Git 工作流

1. 创建新分支
2. 编写文章
3. 提交更改
4. 创建 Pull Request
5. 审核合并

### 提交信息规范

```
feat: 添加新文章
docs: 更新文档
fix: 修复文章错误
refactor: 重构文章结构
```

### 分支命名

```
feature/new-article
bugfix/fix-article
docs/update-documentation
```

## 草稿管理

### 创建草稿

```markdown
---
title: '草稿文章'
date: '2024-01-01'
draft: true
---
```

### 草稿状态

- `draft: true` - 草稿状态，不显示在生产环境
- `draft: false` - 发布状态，显示在生产环境

### 预览草稿

在开发服务器中可以预览草稿文章：

```bash
pnpm dev --preview-drafts
```

## 批量操作

### 创建文章模板

使用脚本创建新文章：

```bash
pnpm new-post "文章标题"
```

### 批量导入

使用脚本批量导入文章：

```bash
pnpm import-posts /path/to/posts/
```

### 批量更新

使用脚本批量更新文章元数据：

```bash
pnpm update-metadata --category "技术"
```

## 最佳实践

### 单一职责

一篇文章只讲一个主题，保持内容聚焦。

### 保持简洁

避免过长的文章，必要时拆分成系列文章。

### 定期更新

定期检查和更新文章内容，保持时效性。

### 备份策略

定期备份文章内容，防止数据丢失。

### 目录索引

为大型文章添加目录：

```markdown
## 目录

- [介绍](#介绍)
- [正文](#正文)
- [结论](#结论)
```

## 常见问题

### 文章找不到

确保文件路径正确，文件名符合规范。

### 图片不显示

检查图片路径是否正确，确保图片文件存在。

### 元数据错误

检查 YAML 格式是否正确，确保字段值符合类型要求。

### 构建失败

检查 Markdown 语法是否正确，确保没有未闭合的标签。