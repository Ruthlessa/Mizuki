/**
 * 文章元数据 JSON 接口：输出全部文章的标题、描述、发布时间等轻量信息。
 * 供站内搜索、日历等客户端脚本按需拉取，不包含正文。
 */
import { getSortedPosts } from "@/utils/content-utils";

/** 汇总全部文章元信息并按发布时间倒序返回 JSON */
export async function GET() {
	const posts = await getSortedPosts();

	const allPostsData = posts
		.map((post) => ({
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			published: post.data.published.getTime(),
			category: post.data.category || "",
			password: !!post.data.password,
		}))
		// 按发布日期降序排列
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData), {
		headers: { "Content-Type": "application/json" },
	});
}
