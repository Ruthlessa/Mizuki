# 部署

## Cloudflare Pages

### 配置步骤

1. 登录 Cloudflare 控制台
2. 创建新的 Pages 项目
3. 连接 GitHub 仓库
4. 配置构建命令：

```
pnpm install && pnpm build
```

5. 配置环境变量：

| 变量名 | 值 |
|--------|-----|
| `NODE_VERSION` | 20 |
| `PNPM_VERSION` | 8 |

6. 部署分支选择 `main` 或 `master`

### 高级配置

在项目根目录创建 `_routes.json` 文件：

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/admin/*"]
}
```

## Vercel

### 配置步骤

1. 登录 Vercel 控制台
2. 导入 GitHub 仓库
3. 配置构建命令：

```
pnpm install && pnpm build
```

4. 配置输出目录为 `dist`

### 环境变量

在 Vercel 控制台添加必要的环境变量。

## Netlify

### 配置步骤

1. 登录 Netlify 控制台
2. 连接 GitHub 仓库
3. 配置构建命令：

```
pnpm install && pnpm build
```

4. 配置发布目录为 `dist`

### 重写规则

创建 `_redirects` 文件：

```
/*    /index.html   200
```

## GitHub Pages

### 配置步骤

1. 创建 `.github/workflows/deploy.yml`
2. 配置 GitHub Actions：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 服务器部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/mizuki/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### PM2 管理

```bash
pm2 start "pnpm dev" --name mizuki
```

## Docker 部署

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

EXPOSE 4321

CMD ["pnpm", "preview", "--host", "0.0.0.0"]
```

### 运行命令

```bash
docker build -t mizuki .
docker run -p 4321:4321 mizuki
```

## 环境变量

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `PUBLIC_BASE_URL` | 网站基础 URL | `https://example.com` |

### 可选变量

| 变量 | 说明 |
|------|------|
| `PUBLIC_GA_ID` | Google Analytics ID |
| `PUBLIC_GTM_ID` | Google Tag Manager ID |
| `CONTENT_REPO` | 内容仓库地址 |
| `CONTENT_BRANCH` | 内容分支 |