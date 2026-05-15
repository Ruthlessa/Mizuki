# 技术文章自动获取与定时发布

本指南说明了如何使用自动化工作流来获取技术文章并定时发布到博客。

## 工作流说明

### 1. Fetch Tech Articles ([`fetch-articles.yml`](../.github/workflows/fetch-articles.yml))

**功能：**
- 每周日自动从 Dev.to 和其他来源获取最新技术文章
- 自动生成博客文章并安排定时发布计划
- 创建 Pull Request 供审核

**触发方式：**
- 自动：每周日午夜 (UTC)
- 手动：在 GitHub Actions 中点击 "Run workflow"

### 2. Check & Update Schedule ([`check-schedule.yml`](../.github/workflows/check-schedule.yml))

**功能：**
- 每天检查文章发布计划
- 更新当天应发布文章的状态
- 自动提交更改

**触发方式：**
- 自动：每天午夜 (UTC)
- 手动：在 GitHub Actions 中点击 "Run workflow"

## 本地脚本

### 获取文章并安排发布

```bash
pnpm fetch-tech-articles
```

**功能：**
- 从 Dev.to API 获取最新技术文章
- 自动生成 Markdown 文章
- 安排 10 篇文章按每天 1 篇的频率发布
- 保存发布计划到 `schedule.json`

### 检查并更新发布状态

```bash
pnpm check-schedule
```

**功能：**
- 检查当天应发布的文章
- 更新文章发布状态
- 显示完整发布计划

## 文件说明

| 文件 | 说明 |
|------|------|
| [`schedule.json`](../schedule.json) | 文章发布计划 |
| [`fetched-articles.json`](../fetched-articles.json) | 获取到的原始文章数据 |
| [`scripts/fetch-tech-articles.mjs`](../scripts/fetch-tech-articles.mjs) | 文章获取脚本 |
| [`scripts/check-schedule.mjs`](../scripts/check-schedule.mjs) | 计划检查脚本 |
| [`src/content/posts/`](../src/content/posts/) | 生成的博客文章 |

## 文章来源

- **主要来源：** Dev.to (API)
- **备用来源：** 内置高质量文章库

## 配置说明

### 修改获取频率

编辑 [`fetch-articles.yml`](../.github/workflows/fetch-articles.yml) 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0 * * 0'  # 每周日午夜
```

### 修改检查频率

编辑 [`check-schedule.yml`](../.github/workflows/check-schedule.yml) 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0 * * *'  # 每天午夜
```

## 故障排除

### Dev.to API 无法访问

脚本会自动使用备用文章库，确保仍然可以获取文章。

### PR 自动创建失败

请确保仓库的 GitHub Actions 权限设置正确：
- Settings > Actions > General > Workflow permissions
- 选择 "Read and write permissions"
- 勾选 "Allow GitHub Actions to create and approve pull requests"

### 文章没有按时显示

Astro 会根据 frontmatter 中的 `published` 日期自动处理文章显示，不需要额外操作。只需确保部署流水线正常运行即可。
