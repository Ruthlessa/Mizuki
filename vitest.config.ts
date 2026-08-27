import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: "happy-dom",
		globals: true,
		include: ["src/**/*.test.ts"],
	},
	define: {
		"import.meta.env.BASE_URL": JSON.stringify("/"),
	},
});
