---
title: FlareDrive 重制版 - 云原生 S3 存储管理器
published: 2026-04-22
description: "FlareDrive 是一款基于 Cloudflare Workers 构建的云原生 S3 兼容存储管理器，支持多种 S3 提供商，提供免费 10GB 存储空间。"
tags: ["FlareDrive", "Cloudflare", "S3", "R2", "开源"]
category: 项目
draft: false
---

## 什么是 FlareDrive

[FlareDrive](https://github.com/Ruthlessa/flaredrive-rev1) 是一款云原生 S3 兼容存储管理器，基于 Cloudflare Workers 构建。它允许你连接多个 S3 兼容的云存储服务，在一个统一的界面中管理你的文件。

> [!TIP]
> FlareDrive 完全开源，采用 MIT 许可证，可以免费使用！

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 后端 | Cloudflare Workers + Hono |
| 数据库 | Cloudflare D1 (SQLite) + Drizzle ORM |
| 前端 | Vue 3 SPA + Naive UI |
| 构建工具 | Vite |
| 存储 | Cloudflare R2 / AWS S3 / MinIO 等 |

## 主要功能

- ✅ **用户注册/登录** - 基于 Cookie 的会话管理
- ✅ **存储桶配置** - 支持连接测试，配置保存在 D1 数据库
- ✅ **对象浏览器** - 列表、预览、删除文件
- ✅ **上传功能** - 通过预签名 URL 上传，记录上传历史
- ✅ **原始文件访问** - 通过 `/api/raw/:bucketId/*` 访问，带权限检查
- ✅ **站点设置** - 存储在 D1 数据库（支持环境变量回退）

## 快速部署

### 环境要求

- Node.js 22+ (推荐 24.x)
- Bun
- Cloudflare 账号

### 本地开发

```bash
# 安装依赖
bun install

# 可选：创建环境变量文件
cp .env.sample .env

# 应用 D1 数据库迁移
bun run drizzle:push

# 启动开发服务器
bun dev
```

默认开发地址：`http://localhost:5880`

### 创建管理员账户

有两种方式：

**方式一：开放注册**

在 `wrangler.jsonc` 中设置 `ALLOW_REGISTER = true`，然后注册账号。第一个注册用户（ID=1）会自动成为管理员。

**方式二：使用管理员创建脚本**

```bash
# 1. 设置 ADMIN_CREATE_TOKEN 为 Worker secret
# 2. 运行创建命令
bun run user:create -- --url http://localhost:5880 --email admin@example.com --password "StrongPass123" --token "<ADMIN_CREATE_TOKEN>"
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `bun dev` | 启动开发服务器 |
| `bun run build` | 构建前端 + Worker 资源 |
| `bun run deploy` | 部署到 Cloudflare Workers |
| `bun run drizzle:push` | 应用本地 D1 数据库迁移 |
| `bun run drizzle:studio` | 打开 Drizzle Studio（本地） |
| `bun run drizzle:push-prod` | 应用生产环境 D1 迁移 |

## 项目结构

```
flaredrive-rev1/
├── backend/        # Worker API (Hono)
├── frontend/        # Vue SPA
├── db/             # Drizzle schema
├── drizzle/        # SQL 迁移文件
└── common/         # 共享工具函数
```

## 截图预览

### My Buckets

管理多个存储桶的界面。

### Gallery Layout

图库视图，适合展示图片。

### Book Layout

书籍视图，适合阅读漫画或电子书。

### Manga!

漫画专用的阅读布局。

## License

MIT License

- Copyright (c) 2022 Siyu Long (before f82ffdc)
- Copyright (c) 2025 Dragon Fish (remastered version)

## 相关链接

- GitHub 仓库：https://github.com/Ruthlessa/flaredrive-rev1
- Cloudflare Workers：https://workers.cloudflare.com/
- Cloudflare R2：https://developers.cloudflare.com/r2/

---

如果你需要一个免费且易于部署的个人云存储解决方案，FlareDrive 绝对值得一试！
