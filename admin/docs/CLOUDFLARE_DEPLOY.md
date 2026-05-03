# Cloudflare 部署指南

## 部署架构

```
Cloudflare Pages (前端)
        ↓
Cloudflare Workers (后端 API)
        ↓
Cloudflare D1 (数据库)
```

---

## 部署步骤

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置 Cloudflare

```bash
# 登录 Cloudflare
npm run cf:login

# 初始化 Wrangler
npm run cf:init
```

### 3. 创建 D1 数据库

```bash
# 创建本地数据库
npm run cf:d1:create

# 将输出中的 database_id 填入 wrangler.toml
```

### 4. 初始化数据库

```bash
# 本地测试
npm run cf:d1:init

# 推送到生产
npm run cf:d1:prod
```

### 5. 部署后端 (Workers)

```bash
# 编辑 worker/index.js 中的 JWT_SECRET
# 修改 wrangler.toml 中的 route

# 部署
npm run cf:deploy
```

### 6. 部署前端 (Pages)

在 Cloudflare Dashboard 中：
1. 进入 **Pages** → **Create a project**
2. 连接 GitHub 仓库
3. 设置构build命令：`npm run build`
4. 设置输出目录：`dist`
5. 添加环境变量：
   - `VITE_API_URL` = `https://api.yourdomain.com`
   - `VITE_APP_TITLE` = `Mizuki Admin`

---

## 配置文件说明

### wrangler.toml
```toml
name = "mizuki-admin-api"
main = "worker/index.js"

[[env.production.d1_databases]]
binding = "DB"
database_name = "mizuki-admin"
database_id = "你的数据库ID"
```

### 环境变量

**后端 (Workers)**
| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 密钥（生产环境必须更改） |
| `DB` | D1 数据库绑定 |

**前端 (Pages)**
| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端 API 地址 |
| `VITE_APP_TITLE` | 应用标题 |

---

## 自定义域名配置

### Workers API
在 Cloudflare Dashboard：
1. **Workers & Pages** → 选择你的 Worker
2. **Triggers** → **Custom Domains**
3. 添加 `api.yourdomain.com`

### Pages 前端
1. **Pages** → 你的项目
2. **Custom Domains**
3. 添加 `admin.yourdomain.com`

---

## 访问地址

部署完成后：

| 服务 | 地址 |
|------|------|
| **管理后台** | `https://admin.yourdomain.com` |
| **API 接口** | `https://api.yourdomain.com/api/*` |

---

## 登录信息

首次部署后，使用以下信息登录：

- **用户名**: `admin`
- **密码**: `admin123`

> ⚠️ **重要**: 部署后请立即修改默认密码！

---

## 常见问题

### 1. D1 数据库创建失败？
确保已登录并有权限创建 D1 数据库。

### 2. 部署后 API 无法访问？
- 检查 Custom Domain 配置
- 检查 CORS 设置
- 查看 Workers 日志

### 3. 前端无法连接后端？
确认 `VITE_API_URL` 环境变量设置正确。

### 4. 数据库表不存在？
运行 `npm run cf:d1:prod` 初始化生产数据库。

---

## 快速命令

```bash
# 开发
npm run cf:dev        # 本地测试 Workers
npm run dev           # 本地测试前端

# 部署
npm run cf:deploy     # 部署后端
# Pages 部署通过 Dashboard 完成

# 数据库
npm run cf:d1:init    # 本地初始化
npm run cf:d1:prod    # 生产初始化
```

---

## 安全建议

- [ ] 修改 `JWT_SECRET` 为强密码
- [ ] 启用 Cloudflare SSL/TLS
- [ ] 配置 WAF 规则
- [ ] 定期备份 D1 数据库
