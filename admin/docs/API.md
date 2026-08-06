# Mizuki Admin API 文档

管理后台后端 API 完整参考，支持 Express.js（本地开发）和 Cloudflare Workers（生产部署）两种运行时。

## 基本信息

| 项目 | 值 |
|------|-----|
| Base URL (本地) | `http://localhost:3000/api` |
| Base URL (Worker) | `https://your-worker.your-subdomain.workers.dev/api` |
| 认证方式 | JWT Bearer Token |
| 数据格式 | JSON |
| CORS | 默认允许 `http://localhost:3001` 和 `http://localhost:5173` |

## 通用响应格式

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

错误响应：
```json
{
  "success": false,
  "message": "错误描述"
}
```

## 认证

受保护的接口需要在请求头携带 JWT：

```
Authorization: Bearer <token>
```

## 角色权限

| 角色 | 说明 | 权限 |
|------|------|------|
| `admin` | 管理员 | 全部权限 |
| `editor` | 编辑 | 文章 CRUD、评论管理、查看用户 |
| `viewer` | 访客 | 仅登录和查看文章 |

---

## 健康检查

### `GET /api/health`

无需认证。

```json
// 响应
{ "status": "ok", "timestamp": "2026-08-06T10:00:00.000Z" }
```

---

## 认证模块 `/api/auth`

### `POST /api/auth/register`

注册新用户。本地 Express 版本可用。

```json
// 请求体
{
  "username": "newuser",       // 必填
  "password": "securepass123", // 必填
  "email": "user@example.com", // 可选
  "role": "viewer"             // 可选，默认 viewer
}
```

| 状态码 | 场景 |
|--------|------|
| 201 | 注册成功 |
| 400 | 用户名/密码为空、用户名已存在 |

### `POST /api/auth/login`

登录，返回 JWT Token。

```json
// 请求体
{
  "username": "admin",
  "password": "admin123"
}
```

```json
// 响应
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@mizuki.dev",
      "role": "admin"
    }
  }
}
```

| 状态码 | 场景 |
|--------|------|
| 200 | 登录成功 |
| 401 | 用户名或密码错误 |

### `GET /api/auth/profile`

获取当前登录用户信息。需要认证。

### `PUT /api/auth/profile`

更新当前用户信息（邮箱等）。需要认证。

```json
{ "email": "new@example.com" }
```

### `PUT /api/auth/password`

修改当前用户密码。需要认证。

```json
{
  "oldPassword": "admin123",
  "newPassword": "newpass456"
}
```

---

## 用户管理 `/api/users`

所有接口需要认证，且 admin/editor 可查看，仅 admin 可写。

### `GET /api/users`

获取用户列表。

### `GET /api/users/:id`

获取单个用户详情。

### `POST /api/users`

创建新用户（仅 admin）。

```json
{
  "username": "editor1",
  "password": "pass1234",
  "email": "editor@example.com",
  "role": "editor"
}
```

### `PUT /api/users/:id`

更新用户信息（仅 admin）。

```json
{
  "username": "editor1",
  "email": "new@example.com",
  "role": "editor",
  "status": "active"
}
```

### `DELETE /api/users/:id`

删除用户（仅 admin，15 分钟内最多 20 次，防止误删）。

---

## 文章管理 `/api/posts`

需要认证，admin/editor 可 CRUD，viewer 只能读。

### `GET /api/posts`

获取文章列表。

| Query 参数 | 说明 |
|------------|------|
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 10 |
| `status` | 筛选状态：draft / published / archived |
| `category` | 按分类筛选 |
| `search` | 搜索标题或内容 |

### `GET /api/posts/:id`

获取文章详情。

### `POST /api/posts`

创建文章。

```json
{
  "title": "文章标题",
  "content": "Markdown 内容...",
  "slug": "optional-slug",
  "category": "前端",
  "tags": "标签1,标签2",
  "status": "draft"
}
```

### `PUT /api/posts/:id`

更新文章。字段同创建。

### `DELETE /api/posts/:id`

删除文章（仅 admin）。

---

## 评论管理 `/api/comments`

需要认证，admin/editor 可操作。

### `GET /api/comments`

获取评论列表。

| Query 参数 | 说明 |
|------------|------|
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 10 |
| `status` | 筛选：pending / approved / spam |
| `post_id` | 按文章筛选 |

### `PUT /api/comments/:id`

更新评论状态。

```json
{ "status": "approved" }
```

### `DELETE /api/comments/:id`

删除评论（仅 admin）。

---

## 日志审计 `/api/logs`

需要 admin 权限。

### `GET /api/logs`

获取操作日志列表。

| Query 参数 | 说明 |
|------------|------|
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 20 |
| `action` | 按操作类型筛选（LOGIN, CREATE, UPDATE, DELETE 等） |
| `user_id` | 按用户筛选 |
| `start_date` / `end_date` | 按时间范围筛选 |

### `GET /api/logs/statistics`

获取日志统计数据（操作次数、活跃用户等）。

---

## 系统设置 `/api/settings`

需要认证。

### `GET /api/settings`

获取全部系统设置，返回 `key → value` 映射。

### `PUT /api/settings`

更新单个设置项。

```json
{
  "key": "site_title",
  "value": "我的博客",
  "description": "站点标题"
}
```

如果 key 已存在则更新，不存在则创建。

---

## 仪表盘 `/api/dashboard`

需要认证。

### `GET /api/dashboard/stats`

获取仪表盘统计数据，包括文章数、评论数、用户数、最近活动等。

---

## 数据库 Schema

Cloudflare D1 版本完整 Schema 见 [worker/schema.sql](../worker/schema.sql)，包含以下表：

| 表 | 说明 |
|----|------|
| `users` | 用户（admin / editor / viewer） |
| `posts` | 文章（draft / published / archived） |
| `categories` | 文章分类 |
| `comments` | 评论（pending / approved / spam） |
| `logs` | 操作审计日志 |
| `settings` | 键值对系统设置 |
| `friends` | 友链申请 |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | Express 监听端口 | `3000` |
| `JWT_SECRET` | JWT 签名密钥（**生产环境必须修改**） | `mizuki-admin-secret-key-2024` |
| `FRONTEND_URL` | CORS 允许的前端地址，逗号分隔 | `http://localhost:3001,http://localhost:5173` |
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_USER` | MySQL 用户 | `root` |
| `DB_PASSWORD` | MySQL 密码 | 空 |
| `DB_NAME` | MySQL 数据库名 | `mizuki_admin` |

## 两种后端的差异

| 特性 | Express.js (本地) | Cloudflare Workers (生产) |
|------|-------------------|---------------------------|
| 数据库 | MySQL | Cloudflare D1 |
| 密码哈希 | bcryptjs | Web Crypto SHA-256 |
| JWT | jsonwebtoken 库 | 自实现（HS256 变体） |
| 注册接口 | ✅ 可用 | ⚠️ 需检查 |
| 速率限制 | express-rate-limit | 手动实现 |
