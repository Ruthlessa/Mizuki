# 内容分离

## 概述

内容分离是将代码仓库与内容仓库分开管理的一种架构模式。

### 优势

- **代码与内容解耦**：代码更新不影响内容，内容更新不影响代码
- **权限管理**：不同团队管理不同仓库
- **性能优化**：内容仓库可以单独优化
- **部署灵活**：支持独立部署和更新

### 适用场景

- 多作者协作
- 频繁更新内容
- 代码和内容生命周期不同

## 配置方法

### 环境变量配置

在 `.env` 文件中配置内容仓库：

```env
CONTENT_REPO=https://github.com/username/content-repo.git
CONTENT_BRANCH=main
CONTENT_PATH=content
```

### 参数说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| CONTENT_REPO | 内容仓库地址 | 空 |
| CONTENT_BRANCH | 内容分支 | main |
| CONTENT_PATH | 内容目录 | content |

### 启用内容分离

在 `src/config.ts` 中配置：

```typescript
export const contentConfig = {
  enableSeparation: true,
  repo: process.env.CONTENT_REPO,
  branch: process.env.CONTENT_BRANCH || 'main',
  path: process.env.CONTENT_PATH || 'content',
};
```

## 内容仓库结构

### 推荐结构

```
content-repo/
├── posts/
│   ├── article1.md
│   ├── article2.md
│   └── article3/
│       ├── index.md
│       └── images/
├── data/
│   ├── friends.ts
│   ├── projects.ts
│   └── diary.ts
└── spec/
    ├── about.md
    └── friends.md
```

### 目录说明

| 目录 | 说明 |
|------|------|
| posts/ | 文章内容 |
| data/ | 静态数据 |
| spec/ | 页面规格 |

## 集成方法

### 初始化内容仓库

```bash
pnpm init-content-repo
```

### 同步内容

```bash
pnpm sync-content
```

### 开发模式

```bash
pnpm dev --content-repo
```

## 部署配置

### GitHub Actions

```yaml
name: Sync Content

on:
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm sync-content
```

### Cloudflare Pages

配置构建命令：

```
pnpm install && pnpm sync-content && pnpm build
```

### Vercel

配置构建命令：

```
pnpm install && pnpm sync-content && pnpm build
```

## 自动部署触发

### 问题描述

启用内容分离后，默认只有代码仓库更新会触发部署，内容仓库更新不会自动触发。

### 解决方案

#### 方法一：使用 GitHub Actions 触发

在内容仓库中添加 `.github/workflows/trigger-deploy.yml`：

```yaml
name: Trigger Deploy

on:
  push:
    branches:
      - main

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deployment
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.PAT_TOKEN }}
          repository: username/code-repo
          event-type: content-update
```

在代码仓库中添加事件监听：

```yaml
name: Deploy on Content Update

on:
  repository_dispatch:
    types: [content-update]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm sync-content
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 方法二：使用 Webhook

配置 Cloudflare Pages 或 Vercel 的 Webhook，在内容仓库更新时触发部署。

#### 方法三：定时同步

使用定时任务定期同步内容：

```yaml
name: Daily Sync

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm sync-content
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 迁移指南

### 步骤一：创建内容仓库

创建一个新的 Git 仓库用于存储内容。

### 步骤二：迁移内容

将现有内容移动到内容仓库：

```bash
# 创建内容仓库
mkdir content-repo
cd content-repo
git init

# 复制内容
cp -r ../code-repo/src/content/posts ./posts
cp -r ../code-repo/src/data ./data
cp -r ../code-repo/src/content/spec ./spec

# 提交并推送
git add .
git commit -m "Initial content"
git remote add origin https://github.com/username/content-repo.git
git push -u origin main
```

### 步骤三：配置代码仓库

更新代码仓库的配置文件：

```env
CONTENT_REPO=https://github.com/username/content-repo.git
CONTENT_BRANCH=main
CONTENT_PATH=content
```

### 步骤四：测试部署

运行构建命令验证配置：

```bash
pnpm sync-content && pnpm build
```

## 注意事项

### 权限配置

确保代码仓库有访问内容仓库的权限：

- 使用 GitHub Personal Access Token
- 配置正确的权限范围

### 缓存策略

配置合理的缓存策略：

- 静态资源设置缓存时间
- 使用版本控制
- 配置 CDN

### 错误处理

添加错误处理机制：

- 内容仓库不可访问时的降级处理
- 网络超时处理
- 日志记录

### 性能优化

- 使用增量同步
- 缓存已同步的内容
- 并行处理

## 最佳实践

### 仓库管理

- 使用单独的分支管理内容
- 定期备份内容
- 配置分支保护规则

### 协作流程

- 使用 Pull Request 审核内容
- 配置代码审查
- 使用标签管理版本

### 安全配置

- 使用环境变量存储敏感信息
- 配置访问控制
- 定期更新依赖

## 常见问题

### 内容同步失败

检查：
- 内容仓库地址是否正确
- 网络连接是否正常
- 权限配置是否正确

### 部署未触发

检查：
- Webhook 配置是否正确
- GitHub Actions 日志
- 触发器配置

### 内容更新不生效

检查：
- 缓存是否过期
- CDN 是否需要刷新
- 构建是否重新运行