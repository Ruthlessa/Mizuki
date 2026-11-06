# 变更记录

记录对使用、部署或视觉有影响的变更。更细的提交历史请查看仓库的 commit 记录。

## 2026-11-06 · 首屏加载优化

- **播放器懒初始化**：音乐播放器不再于页面加载时立即请求歌单与音频流，改为用户首次交互或 4 秒后初始化（`MusicPlayer.svelte`、`musicPlayerStore.ts`）。打开 FAB 面板时会立即补齐初始化，功能不受影响。
- **音频按需加载**：音频改为 `preload="metadata"`，只预取时长信息，完整音频流在点击播放时才请求，避免初始化即产生长时间挂起的流式请求。
- **Live2D 延迟加载**：看板娘资源（约 1.6MB 纹理）改为 `requestIdleCallback` 加载（最多延迟 3.5 秒），不再与首屏资源抢带宽（`Pio.svelte`）。
- **图标本地化**：把项目实际使用的 Iconify 图标子集打包到本地并在 `<head>` 注册，消除每个图标集单独请求 CDN 的等待，未收录的图标仍会自动回退在线 API（`utils/iconify-offline.ts`、`Layout.astro`）。
- **Banner 兜底**：外链随机图 6 秒内未完成时自动移除并降级为渐变背景，避免首屏长时间空白且不再阻塞 `window.load`（`Banner.astro`）。

实测（移动端 390×844，生产构建）：FCP 约 400–530ms，DOMContentLoaded 约 560ms，首屏 Iconify 请求由 8 个降至 2 个。

## 2026-11-03 · 交互修复与依赖升级

- **按钮偶发点击失效**：`Swup` 启用 `loadOnIdle: false`，避免外部请求挂起导致 `load` 不触发、导航退化为整页刷新；悬浮按钮组移出 `z-30` 层叠上下文；Live2D 容器 `z-index` 由 52 降至 40，不再拦截右下角按钮（`astro.config.mjs`、`MainGridLayout.astro`、`public/pio/static/pio.css`）。
- **Cookie 提示不遮挡**：首次访问的自动提示改为底部非遮挡提示条，仅在用户主动打开偏好设置时显示全屏弹窗（`CookieConsent.svelte`）。
- **移动端点击更稳**：按钮补充 `touch-action: manipulation`，按压缩放只作用于内层图标以保持命中区域；文章卡片的悬停抬升限制在支持悬停的精确指针设备（`FloatingButton.astro`、`MusicFabButton.svelte`、`main.css`）。
- **依赖升级**：合并 9 个 Dependabot PR，包含 `svelte 5.57.3`、`overlayscrollbars 2.17.0`、`astro-expressive-code` 组、`axios`、`eslint` 等。
