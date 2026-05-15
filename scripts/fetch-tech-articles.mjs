import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_JSON = path.join(__dirname, "../fetched-articles.json");
const POSTS_DIR = path.join(__dirname, "../src/content/posts");
const SCHEDULE_FILE = path.join(__dirname, "../schedule.json");

const backupArticles = [
  {
    title: "React 19 新特性完全指南",
    url: "https://react.dev/blog/2024/04/25/react-19",
    description: "深入解析 React 19 的革命性更新，包括新的服务器组件架构、性能改进和开发体验提升。",
    source: "React 官方博客",
    tags: ["React", "JavaScript", "Web开发"],
    category: "前端开发"
  },
  {
    title: "TypeScript 5.0 性能优化与类型系统增强",
    url: "https://devblogs.microsoft.com/typescript",
    description: "探索 TypeScript 5.0 带来的更快编译速度、更精确的类型推断、新的装饰器系统以及其他令人兴奋的功能。",
    source: "Microsoft DevBlogs",
    tags: ["TypeScript", "编程", "性能优化"],
    category: "编程语言"
  },
  {
    title: "构建高性能 Next.js 应用最佳实践",
    url: "https://nextjs.org/docs/app/building-your-application",
    description: "使用 Next.js App Router、ISR 和其他先进技术构建快速、可扩展和现代化的 Web 应用程序。",
    source: "Next.js 文档",
    tags: ["Next.js", "React", "Web开发"],
    category: "前端开发"
  },
  {
    title: "Tailwind CSS v4.0：全新架构与设计理念",
    url: "https://tailwindcss.com/blog/tailwindcss-v4",
    description: "全新的 CSS 架构、原生 CSS 变量支持、大幅改进的开发体验和优化的构建速度。",
    source: "Tailwind CSS 博客",
    tags: ["CSS", "Tailwind", "Web开发"],
    category: "前端开发"
  },
  {
    title: "Node.js 22 LTS：企业级开发新特性",
    url: "https://nodejs.org/en/blog",
    description: "Node.js 22 LTS 带来的全新原生模块支持、性能优化、安全增强以及开发工具改进。",
    source: "Node.js 博客",
    tags: ["Node.js", "JavaScript", "后端开发"],
    category: "后端开发"
  },
  {
    title: "Docker 与 Kubernetes 生产环境最佳实践",
    url: "https://docs.docker.com/get-started/",
    description: "从容器化到编排，掌握现代应用部署的完整工作流程。",
    source: "Docker 文档",
    tags: ["Docker", "DevOps", "容器化"],
    category: "DevOps"
  },
  {
    title: "GraphQL 与 REST API：2026 年的架构选择指南",
    url: "https://graphql.org/learn/",
    description: "深入对比 GraphQL 和 REST 架构模式的优缺点，为项目做出明智的技术选择。",
    source: "GraphQL 基金会",
    tags: ["GraphQL", "API", "Web开发"],
    category: "系统架构"
  },
  {
    title: "Svelte 5：下一代前端框架",
    url: "https://svelte.dev/blog/svelte-5-is-alive",
    description: "探索 Svelte 5 的新特性，包括革命性的 Runes 系统、全新的编译器和显著的性能改进。",
    source: "Svelte 博客",
    tags: ["Svelte", "JavaScript", "前端开发"],
    category: "前端开发"
  },
  {
    title: "Git 高级技巧与团队协作最佳实践",
    url: "https://git-scm.com/book",
    description: "从基础到高级，掌握 Git 版本控制的强大功能，提高团队协作效率。",
    source: "Git 文档",
    tags: ["Git", "版本控制", "开发工具"],
    category: "开发工具"
  },
  {
    title: "AI 辅助编程：提升开发效率的完整指南",
    url: "https://github.blog",
    description: "探索如何利用 AI 编程助手来加速开发流程、减少错误和学习新技术。",
    source: "GitHub 博客",
    tags: ["AI", "编程", "开发工具"],
    category: "人工智能"
  }
];

async function fetchDevToArticles(count = 10) {
  try {
    const response = await fetch(`https://dev.to/api/articles?per_page=${count}&top=7`);
    const data = await response.json();
    return data.map((article) => ({
      title: article.title,
      url: article.url,
      description: article.description,
      source: "Dev.to",
      tags: article.tag_list || [],
      category: "技术分享"
    }));
  } catch (error) {
    console.error("获取 Dev.to 文章失败:", error.message);
    return [];
  }
}

async function fetchArticles(total = 10) {
  let articles = [];
  
  try {
    const devToArticles = await fetchDevToArticles(10);
    articles = [...devToArticles];
  } catch (error) {
    console.error("获取文章失败，使用备用文章列表");
  }
  
  if (articles.length < total) {
    const needed = total - articles.length;
    articles = [...articles, ...backupArticles.slice(0, needed)];
  }
  
  return articles.slice(0, total);
}

function generateFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+/g, '-');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function escapeQuotes(str) {
  return (str || '').replace(/"/g, '\\"');
}

function createArticleContent(article, publishDate) {
  const frontmatter = `---
title: "${escapeQuotes(article.title)}"
published: ${formatDate(publishDate)}
description: "${escapeQuotes(article.description || '')}"
tags: ${JSON.stringify(article.tags || [])}
category: "${escapeQuotes(article.category || '技术分享')}"
sourceLink: "${article.url}"
draft: false
---

# ${article.title}

> 原文链接：[${article.source}](${article.url})

${article.description || "这是一篇来自 " + article.source + " 的技术文章，点击上方链接查看原文。"}`;
  
  return frontmatter;
}

async function ensurePostsDir() {
  try {
    await fs.access(POSTS_DIR);
  } catch {
    await fs.mkdir(POSTS_DIR, { recursive: true });
  }
}

async function saveArticleToPost(article, date, index = 0) {
  await ensurePostsDir();
  
  const filename = generateFilename(article.title);
  let filePath = path.join(POSTS_DIR, `${filename}-${Date.now()}-${index}.md`);
  
  let counter = 0;
  while (await fs.access(filePath).then(() => true).catch(() => false)) {
    counter++;
    filePath = path.join(POSTS_DIR, `${filename}-${Date.now()}-${index}-${counter}.md`);
  }
  
  const content = createArticleContent(article, date);
  await fs.writeFile(filePath, content, "utf8");
  
  console.log(`✅ 文章已保存: ${filePath}`);
  
  return filePath;
}

async function saveSchedule(scheduleData) {
  await fs.writeFile(SCHEDULE_FILE, JSON.stringify(scheduleData, null, 2), "utf8");
  console.log(`📅 定时发布计划已保存: ${SCHEDULE_FILE}`);
}

async function loadSchedule() {
  try {
    const data = await fs.readFile(SCHEDULE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return { scheduled: [] };
  }
}

async function main() {
  console.log("🚀 开始获取技术文章...");
  
  const articles = await fetchArticles(10);
  console.log(`✅ 成功获取 ${articles.length} 篇技术文章`);
  
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(articles, null, 2), "utf8");
  
  const today = new Date();
  const scheduleData = { scheduled: [] };
  
  console.log("\n📝 文章列表：");
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    const publishDate = new Date(today);
    publishDate.setDate(today.getDate() + i);
    
    console.log(`\n${i + 1}. [${article.source}] ${article.title}`);
    console.log(`   链接: ${article.url}`);
    
    const filePath = await saveArticleToPost(article, publishDate, i);
    
    scheduleData.scheduled.push({
      title: article.title,
      url: article.url,
      source: article.source,
      filePath: path.relative(__dirname, filePath),
      publishDate: formatDate(publishDate),
      published: false
    });
  }
  
  await saveSchedule(scheduleData);
  
  console.log("\n✨ 完成！所有文章已准备好并设置定时发布！");
}

main().catch((error) => {
  console.error("❌ 失败:", error);
  process.exit(1);
});

export { fetchArticles, saveArticleToPost };
