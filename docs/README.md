# Mizuki 文档索引

欢迎查阅 Mizuki 的详细文档！

## 📚 文档列表

### 核心文档

- **[../README.md](../README.md)** - 项目主文档 (简体中文)
  - 快速开始
  - 功能特性
  - 基础配置
  - 常见问题

### 多语言文档

- **[../README.en.md](../README.en.md)** - English
- **[../README.md](../README.md)** - 简体中文
- **[../README.ja.md](../README.ja.md)** - 日本語
- **[../README.tw.md](../README.tw.md)** - 繁體中文

### 内容分离相关

- **[CONTENT_SEPARATION.md](./CONTENT_SEPARATION.md)** - 内容分离完整指南 ⭐
  - ENABLE_CONTENT_SYNC 控制开关
  - 环境变量配置详解
  - 私有仓库配置方法
  - 模式切换指南
  - 故障排查

- **[CONTENT_REPOSITORY.md](./CONTENT_REPOSITORY.md)** - 内容仓库结构指南
  - 推荐的目录结构
  - 文件组织方式
  - 内容编写规范
  - 图片管理建议

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - 内容迁移指南
  - 从单仓库迁移到分离模式
  - 详细迁移步骤
  - 测试验证方法

### 部署相关

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署完整指南 ⭐
  - 各平台部署配置 (GitHub Pages / Vercel / Netlify / Cloudflare Pages)
  - 内容仓库更新自动触发构建
  - 私有仓库认证
  - 故障排查

- **[AUTO_BUILD_TRIGGER.md](./AUTO_BUILD_TRIGGER.md)** - 自动构建触发快速参考 🆕
  - 5 步快速配置，解决内容更新不触发部署的问题

### 性能与维护

- **[OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)** - 加载性能优化总结
  - Swup 导航、资源预加载、首屏延迟加载与本地图标
- **[PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md)** - 性能监控指南
  - Lighthouse CI、性能指标目标与回归检查
- **[CHANGELOG.md](./CHANGELOG.md)** - 变更记录 🆕
  - 按时间记录修复、优化与依赖升级

## 🚀 快速查找

### 我是新手，想快速开始
→ 阅读 [主 README](../README.md)

### 我想部署博客
→ 阅读 [部署指南](./DEPLOYMENT.md)

### 我想使用内容分离功能
→ 阅读 [内容分离完整指南](./CONTENT_SEPARATION.md)

### 我想从单仓库迁移到分离模式
→ 阅读 [内容迁移指南](./MIGRATION_GUIDE.md)

### 我想配置私有内容仓库
→ 阅读 [内容分离指南 - 私有仓库配置](./CONTENT_SEPARATION.md#-私有仓库配置)

### 我的部署遇到问题
→ 阅读 [部署指南 - 故障排查](./DEPLOYMENT.md#-故障排查)

### 我遇到了内容同步错误
→ 阅读 [内容分离指南 - 故障排查](./CONTENT_SEPARATION.md#-故障排查)

### 内容仓库更新后站点没有自动重新部署 🆕
→ 阅读 [自动构建触发快速参考](./AUTO_BUILD_TRIGGER.md)

### 我想了解最近的修复与优化
→ 阅读 [变更记录](./CHANGELOG.md)

### 我想优化首屏加载速度
→ 阅读 [加载性能优化总结](./OPTIMIZATION_GUIDE.md)

## 📖 文档架构

```
docs/
├── README.md                    # 本文档 - 索引导航
├── CONTENT_SEPARATION.md        # 内容分离核心指南
├── CONTENT_REPOSITORY.md        # 内容仓库结构
├── MIGRATION_GUIDE.md           # 迁移指南
├── DEPLOYMENT.md                # 部署完整指南
├── AUTO_BUILD_TRIGGER.md        # 自动构建触发快速参考
├── OPTIMIZATION_GUIDE.md        # 加载性能优化总结
├── PERFORMANCE_MONITORING.md    # 性能监控指南
├── CHANGELOG.md                 # 变更记录
├── editor/                       # 编辑器配置说明
└── image/                       # 文档图片资源
```

## 🎯 文档使用建议

### 新用户推荐阅读顺序

1. [主 README](../README.md) - 了解项目基本情况
2. [部署指南](./DEPLOYMENT.md) - 选择平台并部署
3. (可选) [内容分离指南](./CONTENT_SEPARATION.md) - 高级功能

### 高级用户推荐

- 直接查阅具体主题的文档
- 使用快速查找定位问题解决方案

## 🤝 需要帮助？

- 查看 [GitHub Issues](https://github.com/Ruthlessa/Mizuki/issues)
- 阅读相关文档的故障排查章节
- 运行 `pnpm run check` 检查类型与 Astro 诊断

祝你使用愉快！🎉
