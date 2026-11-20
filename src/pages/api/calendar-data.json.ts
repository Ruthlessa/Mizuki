/**
 * 日历数据 JSON 接口：按 YYYY-MM-DD 输出每篇文章的发布日期，供日历组件着色。
 */
import { getSortedPosts } from "../../utils/content-utils";

/** 输出文章发布日期清单，日期统一格式化为本地时区的 YYYY-MM-DD */
export async function GET() {
	const posts = await getSortedPosts();

	const allPostsData = posts.map((post) => {
		const date = new Date(post.data.published);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return {
			id: post.id,
			title: post.data.title,
			date: `${year}-${month}-${day}`,
		};
	});

	return new Response(JSON.stringify(allPostsData), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
