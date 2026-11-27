import { expect, test } from "@playwright/test";

// 見本ページの全体を「テーマ × ライト／ダーク」で撮り、基準画像と比べる。
// テーマを足したら themes にも足す
const themes = ["kawasemi", "a2ui-mini"] as const;
const modes = ["light", "dark"] as const;

for (const theme of themes) {
	for (const mode of modes) {
		test(`${theme} ${mode}`, async ({ page }) => {
			// OS の設定はライトに固定し、ダークは ?mode=dark（html[data-theme]）で切り替える
			await page.emulateMedia({
				colorScheme: "light",
				reducedMotion: "reduce",
			});
			await page.goto(`/?theme=${theme}&mode=${mode}`);
			await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
			await page.evaluate(() => document.fonts.ready);
			await expect(page).toHaveScreenshot(`${theme}-${mode}.png`, {
				fullPage: true,
				animations: "disabled",
			});
		});
	}
}
