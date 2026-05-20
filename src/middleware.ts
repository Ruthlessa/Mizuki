import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const url = context.url;
	const pathname = url.pathname;

	// 跳过 API 路由、静态资源和特殊路径
	const isApiRoute = pathname.startsWith("/api/");
	const isStaticAsset = /\.(png|jpg|jpeg|webp|gif|svg|css|js|json|ico|xml|txt)$/i.test(pathname);
	const isRoot = pathname === "/";
	const hasTrailingSlash = pathname.endsWith("/");

	// 如果不是 API、不是静态资源、不是根路径、且没有尾部斜杠，则重定向
	if (!isApiRoute && !isStaticAsset && !isRoot && !hasTrailingSlash) {
		const newUrl = new URL(`${pathname}/`, url.origin);
		if (url.search) {
			newUrl.search = url.search;
		}
		return context.redirect(newUrl, 301);
	}

	return next();
});