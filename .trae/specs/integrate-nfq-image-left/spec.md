# 集成 NFQ 图像到左侧 - 规格文档

## Why
用户希望将 `https://a.nfq.dpdns.org/` 图像集成到一个链接按钮的左侧，作为视觉图标元素。

## What Changes
- 在现有的 DigitalPlat 推广按钮左侧添加一个小方格图像
- 图像使用 `img` 标签，宽度和高度为 16px
- 图像带有圆角和边框样式以融入现有设计

## Impact
- 受影响的功能：DigitalPlat 推广按钮的显示
- 受影响的代码：使用该按钮的页面

## ADDED Requirements
### Requirement: NFQ 图像集成
系统 SHALL 在 DigitalPlat 按钮左侧显示 `https://a.nfq.dpdns.org/` 作为图标

#### Scenario: 成功案例
- **WHEN** 页面加载包含 DigitalPlat 按钮
- **THEN** 按钮左侧显示 NFQ 图像，尺寸为 16x16 像素

## Acceptance Criteria
- NFQ 图像正确显示在按钮左侧
- 图像尺寸为 16x16 像素
- 图像带有圆角和边框样式
- 链接可正常点击跳转
