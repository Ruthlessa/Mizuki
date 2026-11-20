/**
 * robots.txt 接口：按站点地址动态生成爬虫规则与 sitemap 位置。
 * 默认屏蔽全站仅放行首页与文章目录，需按需调整。
 */
import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Disallow: /
Allow: /$
Allow: /posts/

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

/** 返回纯文本格式的 robots.txt 内容 */
export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
