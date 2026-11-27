# kawasemi チケット

[spec.md](spec.md) を実装の順に分けたもの。各チケットは単体で動作を確かめられる大きさにしている。
「依存」は先に終わっている必要があるチケット。

## K1. リポジトリの土台を作る

- 依存: なし
- やること:
  - 手元に `kawasemi` リポジトリを作る（`git init`、`main` ブランチ）
  - `package.json`（`name: kawasemi`、`private` にしない、`license: MIT`）、`LICENSE`、`mise.toml`（node 24.22 以上・pnpm）、`biome.json`、`.gitignore`
  - devDependencies に `@astryxdesign/cli` / `@astryxdesign/build`、peerDependencies に `@astryxdesign/core`（7日ルールを満たす版）
  - kawasemi 自体を開発するときの `CLAUDE.md`（生成物は手で編集しない、7日ルール、テーマはエディタで作る、など）
  - この仕様（spec.md）を `docs/` に移す（済）
- 外に出すもの: GitHub に `akicraft/kawasemi` を作って push する（**本人が実施、または確認のうえで実施**）
- 完了条件: `pnpm install` と `pnpm biome check` が通る

## K2. 角丸を見比べて決める

- 依存: K1
- やること:
  - 11/16 の Kawasemi の設定（spec.md の表）で、角丸だけ `small` と `medium` の2案をテーマエディタで作る
  - それぞれ `show --png` でライト／ダークの見本画像を出し、並べて見てもらう
- 完了条件: 本人がどちらかを選び、spec.md の「決めていないこと」から消す

## K3. 土台のテーマ `kawasemi` を作り、見本ページで表示する

- 依存: K2
- やること:
  - K2 で選んだ角丸で、土台のテーマ `kawasemi` をテーマエディタで確定する（グラフの色の上書きも含む）
  - `astryx theme add` の生成物を `dist/themes/` に出し、コミットする
  - `@fontsource-variable/noto-sans-jp` を dependencies に入れ、kawasemi の CSS から読み込む
  - `package.json` の `exports` を決める
  - `preview/` に Vite＋React の見本ページを作り、**使う側と同じ import のしかたで** kawasemi を読み込んで Astryx の主な部品（ボタン、入力欄、カード、チップ、表など）を並べる
- 完了条件: 見本ページが Noto Sans JP と kawasemi のテーマで表示され、外部のフォントサーバーへのリクエストがない

## K4. Tailwind 用の CSS を同梱する

- 依存: K3
- やること:
  - `dist/tailwind.css` に Tailwind v4 の `@theme` を書き、Astryx のトークンを `var(--…)` で参照する（色・文字・余白・角丸）
  - 見本ページに Tailwind のクラスで書いた部分を足し、Astryx の部品と並べる
- 完了条件: 見本ページで、Tailwind で書いた部分と Astryx の部品の色・角丸・文字がそろっている

## K5. ダークモードの上書きを受ける

- 依存: K4
- やること:
  - `data-color-scheme="light|dark"` で OS の設定を上書きできるよう、テーマと `tailwind.css` の両方で受ける
  - 見本ページに「OS に従う／ライト／ダーク」の切り替えを付ける（見本ページ専用。部品としては配らない）
- 完了条件: OS がライトのままでも、属性で Astryx の部品と Tailwind の部分の両方がダークになる

## K6. a2ui-mini 用のテーマを作る

- 依存: K5
- やること:
  - `--like kawasemi --accent <深い緑>` で `a2ui-mini` のテーマを作る。コントラストの確認を通る色に調整する
  - 生成物を `dist/themes/a2ui-mini.css` に出す
  - 見本ページでテーマを切り替えられるようにする
  - プロジェクトごとのテーマの作り方の手順を README に書く
- 完了条件: 見本ページで `kawasemi` と `a2ui-mini` を切り替えられ、ライト／ダークの両方で Tailwind の部分のアクセント色も変わる

## K7. スクリーンショット比較を入れる

- 依存: K6
- やること:
  - Playwright で「テーマ（2つ）× ライト／ダーク」の4枚を撮って比べるテストを書く
  - 手元（Mac）で回せるようにする（基準画像は K8 で Linux のものに置き換える）
- 完了条件: `pnpm test` で4枚の比較が通り、テーマの色を1つ変えると失敗する

## K8. GitHub Actions で確認を回す

- 依存: K7、K1 の push
- やること:
  - プルリクエストごとに Biome・型チェック・スクリーンショット比較を回すワークフロー
  - 基準画像を Linux で撮り直してコミットする、手動で動かすワークフロー
- 完了条件: プルリクエストでワークフローが通り、わざと色を変えたプルリクエストでは失敗する

## K9. エージェント向けの説明書と README を書く

- 依存: K6
- やること:
  - `AGENTS.md`（spec.md の「エージェント向けの説明書」の内容）。`package.json` の `files` に含める
  - README: 目的、入れ方（`pnpm add github:akicraft/kawasemi#<タグ>`）、読み込み方、テーマの作り方、バージョンの付け方
- 完了条件: 空の Void プロジェクトに入れて、Claude に「設定画面を作って」と頼むと、`AGENTS.md` を読んで Astryx の部品とトークンで組む

## K10. v0.1.0 を出し、a2ui-mini で使う

- 依存: K8、K9
- やること:
  - `v0.1.0` のタグを打つ（**push は確認のうえで実施**）
  - a2ui-mini に `github:akicraft/kawasemi#v0.1.0` を入れ、`a2ui-mini` のテーマを読み込む
  - a2ui-mini の中に、kawasemi のトークンを `--a2ui-*` に写す CSS を書く（spec.md の「A2UI」）
  - a2ui-mini の `globals.css` の独自の色指定をやめる
- 完了条件: a2ui-mini の予約フォームが kawasemi（深い緑）の見た目で表示され、ライト／ダークも切り替わる
