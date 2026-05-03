# Mizuki 管理后台

基于 React + Ant Design + Express.js 的博客管理后台系统。

## 功能特性

- **用户认证与授权**: JWT 身份验证，支持多种角色权限
- **数据管理**: 文章、评论、用户的完整 CRUD 操作
- **系统配置**: 可配置的网站设置管理
- **日志记录**: 完整的操作日志审计功能
- **数据可视化**: 操作统计图表展示

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design 5
- **后端**: Express.js + MySQL + JWT
- **状态管理**: Zustand

## 快速开始

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置数据库

确保 MySQL 数据库已运行，并创建数据库：

```sql
CREATE DATABASE mizuki_admin;
```

### 3. 启动后端服务

```bash
npm run server
```

后端服务将在 `http://localhost:3000` 运行。

### 4. 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:3001` 运行。

### 5. 同时启动前后端

```bash
npm run dev:all
```

## 默认账户

首次启动后，使用以下信息登录：

- **用户名**: admin
- **密码**: admin123

> 注意：首次登录后请立即修改密码！

## 项目结构

```
admin/
├── server/                 # 后端服务
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── middleware/        # 中间件
│   ├── models/            # 数据库模型
│   ├── routes/            # 路由
│   └── index.js           # 入口文件
├── src/                   # 前端源码
│   ├── components/        # React 组件
│   ├── pages/             # 页面组件
│   ├── services/         # API 服务
│   ├── store/            # 状态管理
│   └── styles/           # 样式文件
├── package.json
└── vite.config.ts
```

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/users` | GET/POST | 用户列表/创建用户 |
| `/api/users/:id` | GET/PUT/DELETE | 用户详情/更新/删除 |
| `/api/posts` | GET/POST | 文章列表/创建文章 |
| `/api/posts/:id` | GET/PUT/DELETE | 文章详情/更新/删除 |
| `/api/comments` | GET | 评论列表 |
| `/api/comments/:id` | PUT/DELETE | 评论状态/删除 |
| `/api/logs` | GET | 操作日志 |
| `/api/settings` | GET/PUT | 设置读取/更新 |
| `/api/dashboard/stats` | GET | 仪表盘统计 |

## 权限角色

- **admin**: 超级管理员，拥有所有权限
- **editor**: 编辑，可以管理文章和评论
- **viewer**: 访客，只能查看数据
