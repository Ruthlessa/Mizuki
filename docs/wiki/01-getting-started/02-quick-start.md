# 快速开始

## 环境依赖

### 必要依赖

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/Ruthlessa/Mizuki.git
cd Mizuki
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

4. **启动开发服务器**

```bash
pnpm dev
```

访问 `http://localhost:4321` 即可查看效果。

### 项目启动

#### 开发模式

```bash
pnpm dev
```

#### 生产构建

```bash
pnpm build
```

#### 预览构建结果

```bash
pnpm preview
```

### 目录结构说明

```
├── src/
│   ├── components/    # 组件
│   ├── content/      # 文章内容
│   ├── data/         # 静态数据
│   ├── layouts/      # 布局
│   ├── pages/        # 页面
│   └── scripts/      # 脚本
├── public/           # 静态资源
├── docs/            # 文档
└── admin/           # 管理后台
```

### 核心配置文件

| 文件 | 说明 |
|------|------|
| `src/config.ts` | 主题主配置文件 |
| `astro.config.mjs` | Astro 框架配置 |
| `package.json` | 依赖配置 |
| `.env` | 环境变量 |

### 常见问题

#### 依赖安装失败

确保 Node.js 和 pnpm 版本符合要求：

```bash
node --version
pnpm --version
```

#### 开发服务器无法启动

检查端口是否被占用，或尝试指定其他端口：

```bash
pnpm dev --port 3000
```

#### 构建失败

检查是否有语法错误或缺少依赖：

```bash
pnpm lint
```