# kawasemi を使うときの決まり（エージェント向け）

このプロジェクトの UI は kawasemi で作る。kawasemi は Meta の Astryx（`@astryxdesign/core`）のテーマと、Tailwind CSS v4 用の CSS を配るパッケージで、部品は Astryx のものをそのまま使う。

## 読み込み方

アプリの入口の CSS で、次の順に読み込む。テーマはプロジェクトで使う1つだけ。

```css
/* Tailwind を使うとき（@import "tailwindcss"; の代わり。Astryx の CSS とフォントも入る） */
@import "kawasemi/tailwind.css";
@import "kawasemi/themes/<テーマ名>.css";
```

```css
/* Tailwind を使わないとき */
@import "kawasemi/base.css";
@import "kawasemi/themes/<テーマ名>.css";
```

アプリの一番外側で、テーマと日本語の文言を渡す。

```tsx
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import jaJP from "@astryxdesign/core/locales/ja-JP.generated.js";
import { Theme } from "@astryxdesign/core/theme";
import { kawasemiTheme } from "kawasemi/themes/kawasemi";

export function Root({ children }: { children: React.ReactNode }) {
	return (
		<InternationalizationProvider locale="ja-JP" messages={{ "ja-JP": jaJP }}>
			<Theme theme={kawasemiTheme} mode="system">
				{children}
			</Theme>
		</InternationalizationProvider>
	);
}
```

- テーマの JS の名前は `<テーマ名をキャメルケースにしたもの>Theme`（`kawasemi/themes/a2ui-mini` なら `a2uiMiniTheme`）
- `InternationalizationProvider` を外すと、部品の中の文言（「必須」「閉じる」など）が英語になる
- フォント（Noto Sans JP）は kawasemi の CSS が読み込む。`<link>` や `@font-face`、Google Fonts を書かない

## 部品

1. まず Astryx の部品を使う。何があるかは CLI で引く。使い方は覚えている知識やこのファイルから写さず、毎回 CLI で確かめる

   ```sh
   pnpm exec astryx search "<やりたいこと>"   # 例: "date picker"
   pnpm exec astryx component <部品名>        # 例: Button。props と import の仕方
   ```

   CLI は `@astryxdesign/cli` に入っている。プロジェクトになければ devDependencies に入れる（`@astryxdesign/core` と同じ版）

2. 部品は `@astryxdesign/core/<部品名>` から直接 import する。kawasemi は部品を包み直していない
3. `astryx init` は実行しない（CLAUDE.md や AGENTS.md に部品一覧を書き込むため）

## 色・余白・角丸・文字

値を直接書かない（`#1670a8`、`12px`、`rounded-[6px]` などは使わない）。テーマを変えたりダークモードにしたりしたときに追従しなくなる。

- Astryx の部品の見た目は props（`variant`・`size` など）で選ぶ
- 部品の外は、Tailwind のクラスか Astryx の CSS 変数で書く

### Tailwind のクラス

Tailwind 既定の色（`bg-blue-500`・`text-gray-700` など）は消してあり、使えない。トークンの名前で書く。

| 用途             | クラス                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 文字の色         | `text-primary`・`text-secondary`・`text-disabled`・`text-accent`                                    |
| 面               | `bg-body`（ページ）・`bg-surface`・`bg-card`・`bg-muted`・`bg-popover`                              |
| アクセントの塗り | `bg-accent-bg` と、その上の文字 `text-on-accent`。薄い塗りは `bg-accent-muted`                      |
| 状態             | `bg-success` と `text-on-success`（`info`・`warning`・`error` も同じ）。文字だけなら `text-success` |
| 枠線             | `border border-border`・強めは `border-border-strong`                                               |
| 角丸             | `rounded-sm`（内側）・`rounded-md`（ボタンや入力欄）・`rounded-lg`（カード）・`rounded-full`        |
| 余白             | `p-1` = 4px の段（`p-3` = 12px、`gap-4` = 16px）                                                    |
| 影               | `shadow-sm`・`shadow-md`・`shadow-lg`                                                               |

文字の大きさは Astryx の段で、Tailwind の既定と1段ずれる（`text-base` が 14px、`text-sm` が 12px、`text-lg` が 17px）。見出しや補足は役割の名前で書くと、大きさ・行の高さ・太さがまとめて Astryx の部品とそろう。

| 役割           | クラス                                            |
| -------------- | ------------------------------------------------- |
| 見出し         | `font-heading text-heading-1` 〜 `text-heading-6` |
| 大きめの本文   | `text-large`                                      |
| 本文           | `text-base`                                       |
| ラベル・ボタン | `text-label`                                      |
| 補足           | `text-supporting`                                 |

### CSS 変数

Tailwind を使わない場所では、Astryx の CSS 変数を参照する（例: `var(--color-background-card)`、`var(--spacing-3)`、`var(--radius-element)`）。名前は `pnpm exec astryx docs` で引く。

## ダークモード

- 既定は OS の設定に従う（`<Theme mode="system">`）
- 固定するときは `<Theme mode="light">` か `mode="dark"`。`<html data-theme="light|dark">` が付く。SSR では `<html data-theme="dark">` を直接書いてもよい
- 色はトークンが切り替わるので、ダーク用の色を書き分けない。`dark:` 修飾子は色以外（画像の差し替えなど）にだけ使う。`dark:` は `data-theme` と OS の設定の両方に従う
- 切り替えボタンの部品は kawasemi にない。要るときは下の「自作部品の決まり」で作る

## 自作部品の決まり

1. まず Astryx の部品の組み合わせで作る
2. Astryx にない動きだけ React Aria で作る
3. 見た目はどちらもトークン（Tailwind のクラスか CSS 変数）だけで付ける
4. 作った部品はこのプロジェクトに置く。kawasemi には入れない（2つ以上のプロジェクトで使ったものだけ、人が kawasemi に移す）

## テーマを変えたいとき

テーマ（アクセント色など）は、このプロジェクトでは変えない。CSS 変数を上書きして色を変えることもしない。kawasemi のリポジトリでテーマエディタを使って作り、タグを上げて入れ直す（人に頼む）。
