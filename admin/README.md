# Mizuki 管理后台

基于 React + Ant Design + Express.js 的博客管理后台系统，支持本地开发和 Cloudflare 部署。

## 功能特性

- **用户认证与授权**: JWT 身份验证，支持多种角色权限
- **数据管理**: 文章、评论、用户的完整 CRUD 操作
- **系统配置**: 可配置的网站设置管理
- **日志记录**: 完整的操作日志审计功能
- **数据可视化**: 操作统计图表展示

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design 5
- **后端**: Express.js / Cloudflare Workers
- **数据库**: MySQL / Cloudflare D1
- **状态管理**: Zustand

## 快速开始

### 开发环境

```bash
cd admin
npm install
npm run dev:all
```

访问 http://localhost:3001

### Cloudflare 部署

详细文档请查看 [Cloudflare 部署指南](docs/CLOUDFLARE_DEPLOY.md)

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npm run cf:login

# 3. 创建 D1 数据库
npm run cf:d1:create

# 4. 初始化数据库
npm run cf:d1:prod

# 5. 部署后端
npm run cf:deploy
```

## 项目结构

```
admin/
├── server/                 # Express.js 后端（本地开发）
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── worker/                # Cloudflare Workers 后端（生产部署）
│   ├── index.js
│   └── schema.sql
├── src/                   # 前端源码
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── store/
├── docs/                  # 部署文档
│   ├── CLOUDFLARE_DEPLOY.md
│   ├── REMOTE_DEPLOY.md
│   └── ADDRESS_CONFIG.md
├── wrangler.toml          # Cloudflare Workers 配置
└── package.json
```

## 部署选项

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| **本地开发** | Express.js + MySQL | 开发测试 |
| **Cloudflare** | Workers + D1 | 生产部署 |

## 文档目录

- [Cloudflare 部署指南](docs/CLOUDFLARE_DEPLOY.md)
- [远程部署指南](docs/REMOTE_DEPLOY.md)
- [地址配置指南](docs/ADDRESS_CONFIG.md)

## 默认账户

- **用户名**: admin
- **密码**: admin123

> ⚠️ 部署后请立即修改密码！
