# 修复不可用页面 - 产品需求文档

## Overview
- **Summary**: 修复 Mizuki 博客主题中多个不可用或有问题的页面，包括 devices 页面、albums 详情页面等
- **Purpose**: 确保所有页面能够正常访问和渲染，提升用户体验
- **Target Users**: 博客访问者和管理员

## Goals
- 修复 devices 页面缺少的 JavaScript 文件引用
- 修复 albums 详情页面中的 CSS 语法错误
- 确保所有页面能够正常构建和访问
- 提高代码质量和可维护性

## Non-Goals (Out of Scope)
- 不修改页面的设计风格或布局
- 不添加新功能或特性
- 不优化页面性能（除非修复过程中自然涉及）

## Background & Context
从项目结构分析，发现以下问题：
1. `devices.astro` 引用了 `/js/devices-page-handler.js`，但该文件不存在于 `public/js/` 目录中
2. `albums/[id]/index.astro` 使用了错误的 CSS 语法 `rounded-(--radius-large)` 而不是 `rounded-[var(--radius-large)]`
3. `admin.astro` 在开发模式下硬编码重定向到 `http://localhost:3001`

## Functional Requirements
- **FR-1**: devices 页面能够正常加载并显示设备列表
- **FR-2**: albums 详情页面能够正常渲染，包括封面和照片网格
- **FR-3**: 所有页面能够成功通过构建测试
- **FR-4**: 所有页面能够正常响应式显示

## Non-Functional Requirements
- **NFR-1**: 修复后代码符合项目的代码风格和规范
- **NFR-2**: 不引入新的依赖或技术栈变更
- **NFR-3**: 修复不影响其他页面的功能

## Constraints
- **Technical**: 使用 Astro 框架，遵循项目现有的代码约定
- **Dependencies**: 只能使用项目中已有的依赖

## Assumptions
- 项目已经正确配置，依赖已安装
- 构建工具（pnpm、astro）正常工作

## Acceptance Criteria

### AC-1: devices 页面修复完成
- **Given**: 用户访问 /devices/ 页面
- **When**: 页面加载完成
- **Then**: 设备列表正常显示，过滤功能正常工作
- **Verification**: `programmatic` - 构建成功，页面能够正常访问

### AC-2: albums 详情页面修复完成
- **Given**: 用户访问 /albums/{id}/ 页面
- **When**: 页面加载完成
- **Then**: 相册封面和照片网格正常显示，圆角样式正确应用
- **Verification**: `programmatic` - 构建成功，CSS 语法正确

### AC-3: 构建测试通过
- **Given**: 执行 pnpm build
- **When**: 构建过程完成
- **Then**: 所有页面构建成功，无错误
- **Verification**: `programmatic` - 构建命令返回 0

## Open Questions
- [ ] 是否需要创建 devices-page-handler.js 文件，还是修改 devices.astro 使用现有脚本？
