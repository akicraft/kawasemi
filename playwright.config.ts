import { defineConfig, devices } from "@playwright/test";

// 見本ページをビルドして vite preview で出し、「テーマ × ライト／ダーク」を撮って比べる。
// 基準画像は tests/screenshots/ に OS ごとに置く（コミットするのは Linux のものだけ。K8 の手動ワークフローで撮る）
export default defineConfig({
	testDir: "tests",
	snapshotPathTemplate: "{testDir}/screenshots/{arg}-{platform}{ext}",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: "http://localhost:5199",
		trace: "off",
	},
	expect: {
		toHaveScreenshot: {
			// 色を少し変えただけでも落ちるよう、色の差を許容しない（既定は 0.2。0.02 では
			// アクセントを #2f5d46 → #2f6046 にしても通ってしまった）
			threshold: 0,
			maxDiffPixels: 0,
		},
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1280, height: 900 },
				deviceScaleFactor: 1,
				// Playwright の版と合うブラウザが入っていない環境では、PW_CHROMIUM_PATH で場所を渡す
				launchOptions: process.env.PW_CHROMIUM_PATH
					? { executablePath: process.env.PW_CHROMIUM_PATH }
					: {},
			},
		},
	],
	webServer: {
		command:
			"pnpm --filter kawasemi-preview build && pnpm --filter kawasemi-preview exec vite preview --port 5199 --strictPort",
		url: "http://localhost:5199",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
