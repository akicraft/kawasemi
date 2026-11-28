# kawasemi 仕様

個人開発で使い回すデザインシステム。Meta の Astryx をベースに、テーマ（トークン）を中心に持つ。

- 作成日: 2026-11-27
- 状態: v0.1.0 を公開済み（K1〜K10 完了）
- リポジトリ: `akicraft/kawasemi`

## 背景

A2UI の試作（akicraft/playground の `experiments/20261126-a2ui-mini`）で、エージェントが組んだ画面の見た目はクライアント側のデザインシステムで決まると分かった。
試作ごとに見た目を作るのではなく、今後の個人開発すべてで使える土台を1つ持ちたい。
11/16 に Astryx を試して作った自作テーマ Kawasemi（`claude/practical-wozniak-nj17m4` の `experiments/20261116-astryx-try`）を出発点にする。

## 前提にする技術スタック

akicraft/playground の `docs/tech-stack-muzaru.md` に合わせる。kawasemi に関係するもの:

| 分類           | 技術                                                    |
| -------------- | ------------------------------------------------------- |
| 使う側のアプリ | Void（Vite プラグイン＋CLI、React）、Cloudflare Workers |
| CSS・UI        | Tailwind CSS v4 / React Aria・Astryx                    |
| 開発ツール     | pnpm・Biome・mise、TypeScript                           |
| テスト         | Vitest・Playwright                                      |

## 方針

### 中身と範囲

- kawasemi が持つのは **Astryx のテーマ** が中心。部品は Astryx のものをアプリがそのまま使う
- Astryx を包み直した独自の部品集にはしない（エージェントが Astryx の CLI で部品を正しく引ける強みを残すため）
- 自作部品は必要になったものだけ足す（下の「自作部品の決まり」）

### テーマの構成

- **土台は共通、アクセント色だけプロジェクトごとに変える**
- 土台のテーマ `kawasemi` は 11/16 の Kawasemi の設定を引き継ぐ

  | 項目         | 設定                                                                          |
  | ------------ | ----------------------------------------------------------------------------- |
  | アクセント色 | `#1670a8`（土台の既定。プロジェクトごとに変える）                             |
  | グレー系     | `#78736b`                                                                     |
  | フォント     | Noto Sans JP                                                                  |
  | 角丸         | small（部品 8px・カード 10px。large から変更。K2 で medium と見比べて決めた） |
  | 面           | outlined                                                                      |
  | 見出し       | heavy                                                                         |
  | ボタン       | solid                                                                         |
  | グラフの色   | `--color-data-*` を Kawasemi の設定どおり上書き                               |

- プロジェクトごとのテーマは **kawasemi のリポジトリで** テーマエディタを使って作る
  （`astryx experimental theme editor new <名前> --like kawasemi --accent <色>`）。
  CSS 変数の上書きだけでは、ホバー・薄い背景・ダークモードの色とコントラストの確認が漏れるため
- 最初のリリースに入れるテーマ:
  - `kawasemi`（土台。アクセントはカワセミの青）
  - `a2ui-mini`（アクセントは製本クロスのような深い緑 `#2f5d46`。K6 で決めた）
- 土台と同じ設定でアクセント色だけ変えたテーマは `pnpm new-theme <名前> <色>`（`scripts/new-theme.mjs`）で作る。
  エディタの `new --like` は組み込みテーマしか受けないため、`themes/kawasemi/kawasemi.settings.json` を読んで同じ設定をエディタに渡し直す

#### a2ui-mini の色（K6）

| 役割                   | ライト                  | ダーク    |
| ---------------------- | ----------------------- | --------- |
| `--color-accent`       | `#2f5d46`（指定どおり） | `#78bd99` |
| `--color-text-accent`  | `#2f5d46`               | `#a0d5b8` |
| `--color-on-accent`    | `#ffffff`               | `#12110e` |
| `--color-accent-muted` | `#aee3c6`               | `#005536` |

- 理由: 製本クロスのような、黒に寄せすぎない青みの深い緑。白い文字が 7.6:1 で読め、ライトでは指定した色をそのまま塗りにも文字にも使える
- ダークではエディタが明るい段（70）に動かした（指定の色は暗い背景に対して 2.02:1 で、塗りに要る 3:1 に届かない）。黒い文字が 8.6:1 で読める
- エディタのコントラストの確認で、このテーマが起こした問題はなし

### ダークモード

- OS の設定（`prefers-color-scheme`）に連動するのが基本
- 上書きは Astryx のしくみにそろえる。`<Theme mode="light|dark|system">` が `<html data-theme="light|dark">` を付け外しし、テーマの CSS はこの属性で色を切り替える（K5 で決めた。独自の `data-color-scheme` は作らない）。SSR では `<html data-theme="dark">` を直接書いてもよい
- Tailwind の色のクラスはトークンを参照しているので、そのまま切り替わる。`dark:` 修飾子は `kawasemi/tailwind.css` の `@custom-variant` で、`data-theme` があればそれに、なければ OS の設定に従う
- 切り替えボタンの部品は作らない（必要になったら自作部品の決まりで足す）

### Tailwind

- Tailwind v4 用の CSS（`kawasemi/tailwind.css`）を同梱する
- `@theme` で Astryx のトークン（CSS 変数）を `var(--…)` で参照する。値を2か所に書かない
- プロジェクトごとのテーマやダークモードの切り替えが、Tailwind のクラス（`bg-accent-bg` など）にも自動で反映されること
- 色・余白・角丸・大きさの段は Astryx 同梱の `@astryxdesign/core/tailwind-theme.css` をそのまま使い、Tailwind 既定の色は消す（`bg-blue-500` などは使えない）
- 文字の大きさは Astryx の段に従う（`text-base` が 14px、`text-sm` が 12px で、Tailwind の既定と1段ずれる）。行の高さも Astryx にそろえ、`text-heading-1`〜`6`・`text-large`・`text-label`・`text-supporting` の役割の名前でも書ける（K4 で `dist/tailwind-text.css` に足した）

### フォント

- `@fontsource-variable/noto-sans-jp` を kawasemi の dependencies に入れ、kawasemi の CSS を読み込めばフォントも入るようにする
- 外部（Google Fonts）には取りに行かない

### エージェント向けの説明書

- `AGENTS.md` をパッケージに同梱する。書く内容:
  - テーマの読み込み方（どの CSS を import するか）
  - まず Astryx の部品を使う。部品の使い方は写さず `astryx search <やりたいこと>` と `astryx component <部品名>` で引く（K9 で、0.7.16 の CLI に `how` がないことが分かり直した）
  - Astryx の日本語の文言を出す（`InternationalizationProvider locale="ja-JP"` と `@astryxdesign/core/locales/ja-JP.generated.js`）
  - Tailwind では既定の色が消してあり、トークンの名前で書く
  - ダークモードの切り替え方（`<Theme mode>`）
  - 色・余白・角丸は直接書かず、トークンか Tailwind のクラスを使う
  - フォントの読み込みは書かない（kawasemi が入れる）
  - 自作部品の決まり
- 各プロジェクトの CLAUDE.md には「UI は `node_modules/kawasemi/AGENTS.md` に従う」の1行だけ足す
- `astryx init`（CLAUDE.md に部品一覧を書き込む）は使わない

### 自作部品の決まり

1. まず Astryx の部品の組み合わせで作る
2. Astryx にない動きだけ React Aria で作る
3. 見た目はどちらもトークン（Tailwind のクラスか CSS 変数）だけで付ける
4. 2つ以上のプロジェクトで使ったものだけ kawasemi に入れる。それまでは各プロジェクトに置く

### A2UI

- kawasemi のトークンを `--a2ui-*` に写す CSS は、当面 a2ui-mini の中に置く
- A2UI を使うプロジェクトが2つ目になったら `kawasemi/a2ui.css` として移す
- A2UI の部品を Astryx の部品で描くカタログは作らない（本気で A2UI を使うプロダクトが出てから考える）

## 配布

- 公開リポジトリ、MIT ライセンス（Astryx は MIT、Noto Sans JP は SIL OFL）
- 各プロジェクトには Git から入れる: `pnpm add github:akicraft/kawasemi#v0.1.0`
- バージョンは Git のタグ（semver）。アプリはタグで固定する
  - 色の調整は patch、トークンの追加は minor
  - 0.x の間は、トークン名の変更や Astryx の範囲を上げる変更も minor を上げて区別する
- Git から入れるパッケージは pnpm がビルドスクリプトを走らせないので、**生成物はコミットして配る**
  （`astryx theme add` が出すテーマの CSS / JS、自作部品をビルドした JS と型定義）
- 依存の持ち方:

  | パッケージ                          | 種類                                        | 理由                                                                                                                                                                      |
  | ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@astryxdesign/core`                | peerDependencies（狭い範囲、例: `~0.7.16`） | アプリが直接 import する。アプリの中で1つに保つ                                                                                                                           |
  | `@astryxdesign/theme-neutral`       | peerDependencies（core と同じ範囲）         | テーマの JS がアイコンを neutral から借りる（`@astryxdesign/theme-neutral/built` を import する）ため、実行時にも要る。テーマを作るときの `--like neutral` の土台でもある |
  | `@fontsource-variable/noto-sans-jp` | dependencies                                | アプリは直接触らない                                                                                                                                                      |
  | `@astryxdesign/cli` / `build`       | devDependencies                             | テーマを作るときだけ使う                                                                                                                                                  |

- `package.json` の `exports`（K3 で決めた）:

  | 読み込むもの                 | 中身                                                               |
  | ---------------------------- | ------------------------------------------------------------------ |
  | `kawasemi/base.css`          | Astryx の reset.css・astryx.css と Noto Sans JP。アプリで最初に1回 |
  | `kawasemi/themes/<名前>.css` | テーマの CSS                                                       |
  | `kawasemi/themes/<名前>`     | テーマの JS（`<Theme theme={...}>` に渡す）                        |
  | `kawasemi/tailwind.css`      | Tailwind 用（K4）                                                  |
  | `kawasemi/AGENTS.md`         | エージェント向けの説明書（K9）                                     |
  | `kawasemi/mcp/<ファイル>`    | MCP サーバー用のデータ（K11。下の「MCP 用のデータ」）              |

- テーマのフォントは `"Noto Sans JP Variable", "Noto Sans JP", system-ui, sans-serif`（同梱の可変フォントの名前が `Noto Sans JP Variable` のため）

- Astryx を上げるときは、見本ページの比較を通してから peerDependencies の範囲を広げる
- 依存はどれも npm の7日ルールに沿って、公開から7日以上たった版を入れる

## MCP 用のデータ

個人用の MCP サーバー（akicraft/mcp、Cloudflare Workers）が kawasemi のモジュールとして同梱し、読むだけのツール
（`kawasemi_guide`・`kawasemi_setup`・`kawasemi_themes`・`kawasemi_tokens`・`kawasemi_search_components`・`kawasemi_component`）で返す。
サーバーは実行時に外へ通信しないので、ツールがそのまま返せる形で `dist/mcp/` に置く（K11）。

- `pnpm build` の中で `scripts/build-mcp.mjs` が作る。Node の標準モジュールだけで書き、手で編集しない
- 中身:

  | ファイル          | 中身                                                                                                                                                                                                                                                                       |
  | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `guide.md`        | `AGENTS.md` の写し                                                                                                                                                                                                                                                         |
  | `themes.json`     | テーマごとの名前・アクセント色（`themes/<名前>/<名前>.settings.json` の `accent`）・短い説明・読み込む CSS と JS、`tokens.light` / `tokens.dark` のトークンの値                                                                                                            |
  | `setup.json`      | テーマごとの入れ方（`pnpm-workspace.yaml` の `allowBuilds`、`pnpm add` のコマンド、Tailwind）・CSS の読み込み・`<Theme>` と `InternationalizationProvider` のコード。README と AGENTS.md の「入れ方」「読み込み方」と同じ内容で、タグは `package.json` の version から作る |
  | `components.json` | Astryx の全部品。`@astryxdesign/cli` の `astryx component <名前> --json` の出力（見本ページ用の `playground` は除く）に、`summary`（1行の説明）と `importStatement` を足したもの。`index` は検索用の一覧（名前・グループ・分類・import・説明・キーワード）                 |
  | `meta.json`       | kawasemi の版と Astryx（core・cli・peerDependencies の範囲）の版、テーマの名前                                                                                                                                                                                             |

- トークンの値の読み方:
  - 対象は `--color-*`・`--radius-*`・`--font-*`・`--text-*`・`--spacing-*`
  - Astryx の既定値（`@astryxdesign/core/dist/astryx.css` の `:root`）の上に、`dist/themes/<名前>/<名前>.css` のテーマ本体（`@scope` の `:scope`）を重ねる。余白（`--spacing-*`）と文字の太さ（`--font-weight-*`）はテーマが上書きしないので Astryx の既定値になる
  - `light-dark(a, b)` はライトが a・ダークが b。`var(...)` は解決できるものは解決する（`--_dynamic-type-*` のような未定義の変数は既定の 1 を使う）。rem だけの `calc()` と `min()` は計算する（例: `--font-size-base` は `0.875rem`）。`color-mix()` などはそのまま残す
  - 含めないもの: 画面が狭くタッチのとき（`@media (width < 1024px) and (pointer: coarse)`）の文字の大きさ、写真の上などの `[data-astryx-media]` の値、影（`--shadow-*`）や動き（`--duration-*`）
- CI の「`dist/` が最新か」で `dist/mcp/` も確かめる（Astryx を上げると `components.json` が変わる）

## 確認

- **見本ページ**: リポジトリ内に Vite＋React の小さなページを置く。使う側と同じ読み込み方（テーマ・Tailwind 用の CSS・フォント）で、Astryx の主な部品と Tailwind のクラスを並べる。テーマとライト／ダークを切り替えられる
- **スクリーンショット比較**: Playwright で「テーマ × ライト／ダーク」ごとに撮って前回と比べる（`pnpm test`）。色の差の許容は 0（色の小さな調整も見逃さないため。K7 で決めた）
- **テーマを作るとき**: テーマエディタのコントラストの確認と `show --png` の見本画像
- **GitHub Actions**: プルリクエストごとに Biome・型チェック・スクリーンショット比較を回す。
  基準画像は Linux（GitHub Actions）で作ってコミットし、更新は手動で動かす専用のワークフローで撮り直す
  （`.github/workflows/update-screenshots.yml`。プルリクエストに `update-screenshots` ラベルを付けるか、Actions の画面で Run workflow）

## リポジトリの構成（案）

```
kawasemi/
├── AGENTS.md              # 使う側のエージェント向け説明書（パッケージに同梱）
├── CLAUDE.md              # kawasemi 自体を開発するときのルール
├── README.md
├── LICENSE                # MIT
├── package.json           # exports: ./base.css, ./themes/*.css, ./themes/*, ./tailwind.css
├── mise.toml              # node / pnpm のバージョン固定
├── biome.json
├── themes/                # テーマエディタが管理する設定と見本画像（手で編集しない）
│   ├── kawasemi/
│   └── a2ui-mini/
├── dist/                  # 配布物（コミットする）
│   ├── themes/kawasemi.css
│   ├── themes/a2ui-mini.css
│   ├── tailwind.css
│   └── mcp/               # MCP サーバー用のデータ（K11）
├── preview/               # 見本ページ（Vite＋React）
└── tests/                 # Playwright のスクリーンショット比較
```

## 決めていないこと（実装中に決める）

- なし（a2ui-mini の緑は K6 で `#2f5d46` に決めた）

## やらないこと

- Astryx を包み直した独自の部品集
- Storybook
- npm への公開（人に使ってもらいたくなったら考える）
- A2UI の部品を Astryx で描くカタログ
- ダークモードの切り替えボタンの部品
