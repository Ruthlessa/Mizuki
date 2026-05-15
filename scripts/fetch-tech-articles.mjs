import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const OUTPUT_PATH = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fetched-articles.json",
);

async function fetchHackerNews() {
    try {
        const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
        const topStoryIds = (await response.json()).slice(0, 5);
        const stories = [];
        
        for (const id of topStoryIds) {
            try {
                const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                const item = await itemResponse.json();
                if (item && item.title) {
                    stories.push({
                        title: item.title,
                        url: item.url || `https://news.ycombinator.com/item?id=${id}`,
                        description: `Score: ${item.score} | Comments: ${item.descendants || 0}`,
                        source: "Hacker News",
                        type: "article",
                    });
                }
            } catch (itemError) {
                console.error(`Error fetching Hacker News item ${id}:`, itemError);
            }
        }
        
        return stories;
    } catch (error) {
        console.error("Error fetching Hacker News:", error);
        return [];
    }
}

async function fetchDevToArticles() {
    try {
        const response = await fetch("https://dev.to/api/articles?per_page=5&top=7");
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

async function fetchGitHubTrendingRepos() {
    try {
        const response = await fetch("https://gh-trending-api.herokuapp.com/repositories");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const repos = data.slice(0, 5).map((repo) => ({
            title: repo.author + " / " + repo.name,
            url: repo.url,
            description: repo.description,
            source: "GitHub Trending",
            type: "repository",
            language: repo.language,
        }));
        return repos;
    } catch (error) {
        console.error("Error fetching GitHub trending via API:", error);
        return [];
    }
}

async function main() {
    console.log("🚀 开始抓取技术文章...");
    
    const [hackerNews, devToArticles, gitHubTrending] = await Promise.all([
        fetchHackerNews(),
        fetchDevToArticles(),
        fetchGitHubTrendingRepos(),
    ]);
    
    const allArticles = [...hackerNews, ...devToArticles, ...gitHubTrending].slice(0, 10);
    
    console.log(`✅ 成功抓取 ${allArticles.length} 篇技术文章/资源`);
    
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allArticles, null, 2), "utf8");
    console.log(`📄 文章已保存到: ${OUTPUT_PATH}`);
    
    console.log("\n📋 抓取到的文章列表:");
    allArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. [${article.source}] ${article.title}`);
        console.log(`   链接: ${article.url}`);
        if (article.description) {
            console.log(`   简介: ${article.description.substring(0, 100)}${article.description.length > 100 ? "..." : ""}`);
        }
    });
}

main().catch((error) => {
    console.error("❌ 抓取失败:", error);
    process.exit(1);
});
