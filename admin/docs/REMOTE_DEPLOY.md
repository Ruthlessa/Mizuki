# 远程环境配置指南

## 环境地址

### 生产环境示例

| 服务 | 示例地址 | 说明 |
|------|---------|------|
| **后端 API** | `http://your-server-ip:3000` | 后端服务地址 |
| **前端静态** | `http://your-server-ip:3001` | 前端管理后台 |

---

## 远程部署配置步骤

### 1. 修改后端配置 (server/config/index.js)

确保后端监听所有网络接口：

```javascript
module.exports = {
  port: process.env.PORT || 3000,  // 监听所有端口
  jwtSecret: process.env.JWT_SECRET,
  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3001'],
    credentials: true,
  },
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
```

### 2. 修改前端 API 地址 (.env)

```env
VITE_API_URL=http://你的服务器IP:3000
```

### 3. 配置 Nginx 反向代理（推荐）

**后端 API (端口 3000)**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**前端后台 (端口 3001)**

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 使用 systemd 启动后端服务

创建服务文件 `/etc/systemd/system/mizuki-admin.service`：

```ini
[Unit]
Description=Mizuki Admin Backend
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/admin
ExecStart=/usr/bin/node server/index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable mizuki-admin
sudo systemctl start mizuki-admin
```

---

## 一键部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

# 1. 构建前端
npm run build

# 2. 复制到 Nginx 目录
sudo cp -r dist/* /var/www/admin/

# 3. 重启后端服务
sudo systemctl restart mizuki-admin

echo "部署完成！"
echo "前端地址: http://你的域名"
echo "后端API: http://你的域名/api"
```

---

## 远程访问测试

### 测试后端 API
```bash
curl http://你的服务器IP:3000/api/health
```

预期响应：
```json
{"status":"ok","timestamp":"2026-05-03T..."}
```

### 测试登录接口
```bash
curl -X POST http://你的服务器IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 常见问题

### 1. 后端无法启动？
检查数据库连接：
```bash
mysql -h localhost -u root -p -e "SHOW DATABASES;"
```

### 2. 前端无法连接后端？
- 检查 CORS 配置
- 检查防火墙是否开放端口
- 检查 Nginx 代理是否正确

### 3. 端口被占用？
```bash
# 查找占用端口的进程
lsof -i :3000
# 或
netstat -tlnp | grep 3000
```

### 4. 安全建议
- [ ] 修改默认 JWT_SECRET
- [ ] 配置 HTTPS
- [ ] 启用防火墙
- [ ] 定期备份数据库
