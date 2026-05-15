import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const OUTPUT_PATH = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fetched-articles.json",
);

// 备用的精选技术文章列表
const backupArticles = [
    {
        title: "React 19 新特性全面解析",
        url: "https://react.dev/blog/2024/04/25/react-19",
        description: "React 19 带来了全新的服务器组件和客户端组件架构，大幅提升了开发体验和应用性能",
        source: "React Official Blog",
        type: "article",
        tags: ["React", "JavaScript", "Web开发"],
    },
    {
        title: "TypeScript 5.0 性能优化指南",
        url: "https://devblogs.microsoft.com/typescript",
        description: "TypeScript 5.0 提供了更快的编译速度、更精确的类型推断以及新的装饰器系统",
        source: "Microsoft DevBlogs",
        type: "article",
        tags: ["TypeScript", "编程", "性能优化"],
    },
    {
        title: "构建高性能的 Next.js 应用",
        url: "https://nextjs.org/docs/app/building-your-application",
        description: "使用 Next.js App Router、ISR 和其他先进技术来构建快速、可扩展的现代应用",
        source: "Next.js Documentation",
        type: "article",
        tags: ["Next.js", "React", "Web开发"],
    },
    {
        title: "Tailwind CSS v4.0 革命性更新",
        url: "https://tailwindcss.com/blog/tailwindcss-v4",
        description: "全新的 CSS 架构、原生 CSS 变量支持和大幅改进的开发体验",
        source: "Tailwind CSS Blog",
        type: "article",
        tags: ["CSS", "Tailwind", "Web开发"],
    },
    {
        title: "Node.js 22 LTS 发布：新特性一览",
        url: "https://nodejs.org/en/blog",
        description: "Node.js 22 带来了全新的原生模块支持、性能改进和安全增强",
        source: "Node.js Blog",
        type: "article",
        tags: ["Node.js", "JavaScript", "后端开发"],
    },
    {
        title: "Docker 最佳实践：从入门到生产",
        url: "https://docs.docker.com/get-started/",
        description: "学习如何使用 Docker 容器化应用、管理容器编排和优化生产部署",
        source: "Docker Documentation",
        type: "article",
        tags: ["Docker", "DevOps", "容器化"],
    },
    {
        title: "GraphQL vs REST：2024 年该选哪个？",
        url: "https://graphql.org/learn/",
        description: "深入比较 GraphQL 和 REST API 的优缺点，帮助你为项目做出明智的选择",
        source: "GraphQL Foundation",
        type: "article",
        tags: ["GraphQL", "API", "Web开发"],
    },
    {
        title: "Svelte 5 抢先体验指南",
        url: "https://svelte.dev/blog/svelte-5-is-alive",
        description: "探索 Svelte 5 的新特性，包括 Runes、全新的编译器和显著的性能改进",
        source: "Svelte Blog",
        type: "article",
        tags: ["Svelte", "JavaScript", "前端开发"],
    },
    {
        title: "Git 高级技巧和最佳实践",
        url: "https://git-scm.com/book",
        description: "从基础到高级，掌握 Git 版本控制的强大功能，提高团队协作效率",
        source: "Git Documentation",
        type: "article",
        tags: ["Git", "版本控制", "开发工具"],
    },
    {
        title: "AI 辅助编程：使用 Copilot 和 Cursor 提高效率",
        url: "https://github.blog",
        description: "探索如何利用 AI 编程助手来加速开发流程、减少错误和学习新技术",
        source: "GitHub Blog",
        type: "article",
        tags: ["AI", "编程", "开发工具"],
    },
];

async function fetchDevToArticles() {
    try {
        const response = await fetch("https://dev.to/api/articles?per_page=10&top=7");
        const data = await response.json();
        const articles = data.map((article) => ({
            title: article.title,
            url: article.url,
            description: article.description,
            source: "Dev.to",
            type: "article",
            tags: article.tag_list,
        }));
        return articles;
    } catch (error) {
        console.error("Error fetching Dev.to articles:", error);
        return [];
    }
}

async function main() {
    console.log("🚀 开始抓取技术文章...");
    
    // 尝试获取 Dev.to 的文章
    const devToArticles = await fetchDevToArticles();
    
    // 合并文章，确保有 10 篇
    let allArticles = [...devToArticles];
    
    // 如果 Dev.to 的文章不够 10 篇，从备用列表补充
    if (allArticles.length < 10) {
        const neededCount = 10 - allArticles.length;
        allArticles = [...allArticles, ...backupArticles.slice(0, neededCount)];
    }
    
    // 确保不超过 10 篇
    allArticles = allArticles.slice(0, 10);
    
    console.log(`✅ 成功获取 ${allArticles.length} 篇技术文章/资源`);
    
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allArticles, null, 2), "utf8");
    console.log(`📄 文章已保存到: ${OUTPUT_PATH}`);
    
    console.log("\n📋 文章列表:");
    allArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. [${article.source}] ${article.title}`);
        console.log(`   链接: ${article.url}`);
        if (article.description) {
            console.log(`   简介: ${article.description}`);
        }
    });
}

main().catch((error) => {
    console.error("❌ 抓取失败:", error);
    process.exit(1);
});
