# 地址配置指南

## 快速访问地址

### 开发环境

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端管理后台** | http://localhost:3001 | React + Vite 开发服务器 |
| **后端 API** | http://localhost:3000 | Express.js API 服务 |
| **API 文档** | http://localhost:3000/api/health | 健康检查端点 |

### 生产环境

你需要根据部署情况修改以下配置：

## 地址配置步骤

### 1. 复制环境变量模板

```bash
cd admin
cp .env.example .env
```

### 2. 编辑 `.env` 文件

```env
# 前端配置
VITE_API_BASE_URL=http://your-backend-api.com/api

# 后端配置
PORT=3000
JWT_SECRET=your-super-secret-key-here
FRONTEND_URL=http://localhost:3001,http://your-frontend.com

# 数据库配置
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mizuki_admin
```

### 3. 修改前端代理（vite.config.ts）

如果需要修改前端代理，编辑 `vite.config.ts`：

```typescript
server: {
  port: 3001,  // 前端端口
  proxy: {
    '/api': {
      target: 'http://your-backend-server:3000',  // 后端地址
      changeOrigin: true,
    },
  },
}
```

### 4. 修改后端 CORS 配置（server/config/index.js）

确保允许你的前端域名：

```javascript
cors: {
  origin: ['http://localhost:3001', 'http://your-frontend.com'],
  credentials: true,
}
```

## 部署建议

### Docker 部署

```dockerfile
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=mysql
      - DB_USER=mizuki
      - DB_PASSWORD=password

  frontend:
    build: ./admin
    ports:
      - "3001:80"
    depends_on:
      - backend
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 路由结构

```
/
├── /login              # 登录页
├── /                   # 仪表盘
├── /users             # 用户管理
├── /posts             # 文章管理
├── /comments          # 评论管理
├── /logs              # 操作日志
└── /settings          # 系统设置
```

## 常见问题

### Q: 前端无法连接后端？
A: 检查 CORS 配置，确保前端地址在允许的 origin 列表中。

### Q: 如何修改端口？
A: 在 `.env` 文件中修改 `PORT` 变量。

### Q: 如何在局域网访问？
A: 修改 vite.config.ts：
```typescript
server: {
  host: '0.0.0.0',
  port: 3001,
}
```
然后访问 http://你的IP:3001
