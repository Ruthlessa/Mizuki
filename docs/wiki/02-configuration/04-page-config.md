# 页面配置

## 页面体系架构

项目采用文件系统路由，页面结构如下：

```
src/pages/
├── about.astro          # 关于页面
├── diary.astro          # 日记页面
├── friends.astro        # 友链页面
├── timeline.astro       # 时间线页面
├── skills.astro         # 技能页面
├── devices.astro        # 设备页面
├── anime.astro          # 番剧页面
├── albums.astro         # 相册页面
├── projects.astro       # 项目页面
├── posts/               # 文章列表
│   └── [...slug].astro  # 文章详情
└── albums/              # 相册详情
    └── [id]/
        └── index.astro
```

## 关于页面

### 配置方式

在 `src/content/spec/about.md` 中配置：

```markdown
---
title: '关于我'
subtitle: 'Welcome to my blog'
---

## 介绍

这是我的个人博客，记录技术分享和生活点滴。
```

### 数据结构

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 页面标题 |
| subtitle | string | 副标题 |
| content | string | Markdown 内容 |

## 日记页面

### 数据来源

日记数据位于 `src/data/diary.ts`：

```typescript
export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  images?: string[];
}

export const diaryData: DiaryEntry[] = [
  {
    id: '1',
    date: '2024-01-01',
    title: '新年快乐',
    content: '新的一年开始了...',
    images: ['/images/diary/1.webp'],
  },
];
```

### 配置说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| date | string | 日期 (YYYY-MM-DD) |
| title | string | 日记标题 |
| content | string | 日记内容 |
| images | string[] | 图片路径数组 |

## 友链页面

### 数据来源

友链数据位于 `src/data/friends.ts`：

```typescript
export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar: string;
  status: 'active' | 'inactive' | 'hidden';
}

export const friendsData: Friend[] = [
  {
    id: '1',
    name: 'Friend Name',
    url: 'https://example.com',
    description: 'A great blog',
    avatar: '/images/friends/avatar.webp',
    status: 'active',
  },
];
```

### 状态说明

| 状态 | 说明 |
|------|------|
| active | 正常显示 |
| inactive | 显示但标记为离线 |
| hidden | 隐藏不显示 |

## 时间线页面

### 数据来源

时间线数据位于 `src/data/timeline.ts`：

```typescript
export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
}

export const timelineData: TimelineItem[] = [
  {
    id: '1',
    date: '2024-01-01',
    title: '开始写博客',
    description: '创建了第一个博客文章',
    category: 'Blog',
  },
];
```

### 分类配置

支持自定义分类，分类会自动分组显示。

## 技能页面

### 数据来源

技能数据位于 `src/data/skills.ts`：

```typescript
export interface Skill {
  id: string;
  name: string;
  level: number; // 1-100
  category: string;
  icon?: string;
}

export const skillsData: Skill[] = [
  {
    id: '1',
    name: 'TypeScript',
    level: 90,
    category: 'Programming',
    icon: 'material-symbols:code',
  },
];
```

### 技能等级

等级范围为 1-100，显示为进度条。

## 设备页面

### 数据来源

设备数据位于 `src/data/devices.ts`：

```typescript
export interface Device {
  id: string;
  name: string;
  brand: string;
  type: string;
  image: string;
  purchaseDate: string;
  status: 'active' | 'retired';
  specs: {
    key: string;
    value: string;
  }[];
}

export const devicesData: Device[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    type: 'Smartphone',
    image: '/images/device/iphone.webp',
    purchaseDate: '2024-09-20',
    status: 'active',
    specs: [
      { key: 'CPU', value: 'A17 Pro' },
      { key: 'RAM', value: '8GB' },
    ],
  },
];
```

## 番剧页面

### 数据来源

番剧数据位于 `src/data/anime.ts`：

```typescript
export interface Anime {
  id: string;
  title: string;
  titleEn?: string;
  cover: string;
  status: 'watching' | 'completed' | 'planned' | 'dropped';
  rating?: number;
  episodes: number;
  watchedEpisodes: number;
  season: string;
  tags: string[];
}

export const animeData: Anime[] = [
  {
    id: '1',
    title: '进击的巨人',
    titleEn: 'Attack on Titan',
    cover: '/images/anime/aot.webp',
    status: 'completed',
    rating: 9.5,
    episodes: 87,
    watchedEpisodes: 87,
    season: '2013',
    tags: ['Action', 'Fantasy'],
  },
];
```

### 状态说明

| 状态 | 说明 |
|------|------|
| watching | 追看中 |
| completed | 已完成 |
| planned | 计划观看 |
| dropped | 已弃番 |

## 相册页面

### 数据结构

相册数据位于 `public/images/albums/` 目录：

```
albums/
├── AlbumName/
│   ├── cover.webp
│   ├── 1.webp
│   ├── 2.webp
│   └── info.json
└── README.md
```

### info.json 配置

```json
{
  "title": "相册名称",
  "description": "相册描述",
  "date": "2024-01-01",
  "tags": ["tag1", "tag2"]
}
```

### 图片要求

- 推荐格式：WebP
- 推荐尺寸：1920x1080
- 最大文件大小：2MB

## 项目页面

### 数据来源

项目数据位于 `src/data/projects.ts`：

```typescript
export interface Project {
  id: string;
  name: string;
  description: string;
  cover: string;
  tags: string[];
  url?: string;
  github?: string;
  status: 'active' | 'maintenance' | 'completed' | 'paused';
}

export const projectsData: Project[] = [
  {
    id: '1',
    name: 'Mizuki',
    description: 'A modern blog theme',
    cover: '/images/projects/mizuki.webp',
    tags: ['Astro', 'Svelte', 'TypeScript'],
    url: 'https://example.com',
    github: 'https://github.com/Ruthlessa/Mizuki',
    status: 'active',
  },
];
```

### 状态说明

| 状态 | 说明 |
|------|------|
| active | 活跃开发中 |
| maintenance | 维护中 |
| completed | 已完成 |
| paused | 暂停开发 |