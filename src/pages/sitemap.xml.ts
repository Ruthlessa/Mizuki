import { getSitemap } from "@astrojs/sitemap";
import type { APIContext } from "astro";

import { siteConfig } from "@/config";

export async function GET(context: APIContext) {
	return getSitemap(context, {
		filter: (page) => {
			// 排除特定页面
			return !page.includes("/admin/") && !page.includes("/404");
		},
		sitemap: {
			lastmod: new Date().toISOString(),
			changefreq: "weekly",
			priority: 0.7,
		},
	});
}