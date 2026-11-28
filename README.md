# kawasemi

[Astryx](https://astryx.atmeta.com/) をベースにした、個人開発用のデザインシステム。

- 文字・余白・形などの土台は共通で、アクセント色だけをプロジェクトごとに変えられる
- Tailwind CSS v4 からも同じトークンを使える
- Noto Sans JP を同梱し、ダークモードは OS の設定に連動する

中身は Astryx のテーマと Tailwind 用の CSS が中心で、部品は Astryx のものをそのまま使う。方針は [docs/spec.md](docs/spec.md)。

## テーマ

| 名前        | アクセント                            |
| ----------- | ------------------------------------- |
| `kawasemi`  | `#1670a8`（カワセミの青。土台）       |
| `a2ui-mini` | `#2f5d46`（製本クロスのような深い緑） |

## 入れ方

Git のタグを指定して入れる（npm には公開していない）。

先に、`pnpm-workspace.yaml` で Astryx のインストール時スクリプトを走らせない設定を書く。中身は「`astryx init` を実行して」と表示するだけで、pnpm は許可の有無を決めていないスクリプトがあるとインストールを止める（`astryx init` は使わない。下の「エージェントに使わせる」）。

```yaml
# pnpm-workspace.yaml
allowBuilds:
  "@astryxdesign/core": false
  "@astryxdesign/cli": false
```

```sh
pnpm add github:akicraft/kawasemi#v0.1.1
pnpm add @astryxdesign/core@~0.7.16 @astryxdesign/theme-neutral@~0.7.16 @stylexjs/stylex react react-dom
pnpm add -D @astryxdesign/cli@~0.7.16   # 部品の使い方を引く CLI（エージェントが使う）
```

Tailwind を使うときは `tailwindcss` と `@tailwindcss/vite` も入れ（v4.3 以上）、`vite.config.ts` の `plugins` に足す。

```sh
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [tailwindcss() /* , ほかのプラグイン */],
});
```

## 読み込み方

```css
/* アプリの入口の CSS。Tailwind を使わないときは 1 行目を @import "kawasemi/base.css"; にする */
@import "kawasemi/tailwind.css";
@import "kawasemi/themes/kawasemi.css";
```

```tsx
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import jaJP from "@astryxdesign/core/locales/ja-JP.generated.js";
import { Theme } from "@astryxdesign/core/theme";
import { kawasemiTheme } from "kawasemi/themes/kawasemi";

<InternationalizationProvider locale="ja-JP" messages={{ "ja-JP": jaJP }}>
	<Theme theme={kawasemiTheme} mode="system">
		<App />
	</Theme>
</InternationalizationProvider>;
```

- `InternationalizationProvider` と `ja-JP` で、部品の中の文言（「必須」「閉じる」など）が日本語になる
- Tailwind では既定の色（`bg-blue-500` など）が消してあり、トークンの名前で書く（`bg-card`・`text-primary`・`bg-accent-bg`・`text-on-accent` など）。文字の大きさは Astryx の段で、`text-base` が 14px
- ダークモードは `<Theme mode="light|dark|system">`。`<html data-theme>` が付き、Tailwind の `dark:` もこれに従う

### エージェントに使わせる

パッケージに [AGENTS.md](AGENTS.md) が入っている。プロジェクトの `CLAUDE.md` に次の1行を足す。

```md
UI は `node_modules/kawasemi/AGENTS.md` に従う。
```

`astryx init` は使わない（CLAUDE.md に部品一覧を書き込むため）。

## バージョンの付け方

Git のタグ（semver）。アプリはタグで固定する。

- 色の調整は patch、トークンの追加は minor
- 0.x の間は、トークン名の変更や Astryx の範囲を上げる変更も minor
- Astryx を上げるときは、見本ページのスクリーンショット比較を通してから peerDependencies の範囲を広げる

## プロジェクトごとのテーマを作る

テーマは kawasemi のリポジトリで、Astryx のテーマエディタを使って作る。CSS 変数の上書きで済ませないのは、ホバー・薄い背景・ダークモードの色とコントラストの確認をエディタに任せるため。

1. 土台の kawasemi と同じ設定で、アクセント色だけ変えたテーマを作る

   ```sh
   pnpm new-theme <名前> "<アクセント色>"
   ```

   エディタの `new --like` は組み込みテーマしか受けないので、このスクリプトが `themes/kawasemi/kawasemi.settings.json` を読み、同じ設定をエディタに渡し直す。

2. エディタの結果の `colorNotes` を読み、文字や塗りが読める濃さに動かされた色を確かめる。色を変えるときは次のようにする

   ```sh
   pnpm exec astryx experimental theme editor set <名前> accent "<色>"
   pnpm exec astryx experimental theme editor show <名前> --png
   ```

3. `pnpm build` で `dist/themes/<名前>/` を作る
4. 見本ページの `preview/src/themes.ts` と `preview/src/styles.css` に足し、`?theme=<名前>&mode=light|dark` で見る
5. `themes/`・`src/themes/`・`dist/themes/` をまとめてコミットする（どれも手で編集しない）

## kawasemi 自体の開発

[CLAUDE.md](CLAUDE.md) にコマンドと決まりがある。見本ページは `pnpm --filter kawasemi-preview dev`（http://localhost:5199、`?theme=` と `?mode=` で切り替え）、スクリーンショット比較は `pnpm test`。

## ライセンス

MIT（Astryx は MIT、Noto Sans JP は SIL OFL 1.1）
