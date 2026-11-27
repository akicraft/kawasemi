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
- 結果: small に決めた（2026-11-27）。`--like neutral` で作るため `@astryxdesign/theme-neutral` を devDependencies に足した

## K3. 土台のテーマ `kawasemi` を作り、見本ページで表示する

- 依存: K2
- やること:
  - K2 で選んだ角丸で、土台のテーマ `kawasemi` をテーマエディタで確定する（グラフの色の上書きも含む）
  - `astryx theme add` の生成物を `dist/themes/` に出し、コミットする
  - `@fontsource-variable/noto-sans-jp` を dependencies に入れ、kawasemi の CSS から読み込む
  - `package.json` の `exports` を決める
  - `preview/` に Vite＋React の見本ページを作り、**使う側と同じ import のしかたで** kawasemi を読み込んで Astryx の主な部品（ボタン、入力欄、カード、チップ、表など）を並べる
- 完了条件: 見本ページが Noto Sans JP と kawasemi のテーマで表示され、外部のフォントサーバーへのリクエストがない
- 結果（2026-11-27）: 完了。`astryx theme add` は使わず、エディタが書く `src/themes/` を `pnpm build` で `dist/themes/` にコピーする形にした。見本ページは pnpm workspace の `preview/` で、`kawasemi: workspace:*` として読み込む。Astryx の日本語の文言（`InternationalizationProvider` と `ja-JP`）も使う

## K4. Tailwind 用の CSS を同梱する

- 依存: K3
- やること:
  - `dist/tailwind.css` に Tailwind v4 の `@theme` を書き、Astryx のトークンを `var(--…)` で参照する（色・文字・余白・角丸）
  - 見本ページに Tailwind のクラスで書いた部分を足し、Astryx の部品と並べる
- 完了条件: 見本ページで、Tailwind で書いた部分と Astryx の部品の色・角丸・文字がそろっている
- 結果（2026-11-27）: 完了。ライト／ダークのスクリーンショットと計算後のスタイルで比べ、色・角丸・字体はそろっていた。ずれていたのは文字で、Astryx の `tailwind-theme.css` は `text-sm` などの大きさしか Astryx に向けず、行の高さは Tailwind の既定のままだった。`dist/tailwind-text.css` を足し、大きさの段ごとの行の高さを Astryx にそろえ、`text-heading-3`・`text-label`・`text-supporting` など役割の名前で大きさ・行の高さ・太さをまとめて付けられるようにした。見本ページのクラス名も、Astryx の大きさの段（`text-base` が 14px、`text-sm` が 12px）に合わせて直した。残る差はカードの内側の余白の 1px（Astryx は枠線の分を引いて 11px、Tailwind の `p-3` は 12px）で、そのままにした

## K5. ダークモードの上書きを受ける

- 依存: K4
- やること:
  - `data-color-scheme="light|dark"` で OS の設定を上書きできるよう、テーマと `tailwind.css` の両方で受ける
  - 見本ページに「OS に従う／ライト／ダーク」の切り替えを付ける（見本ページ専用。部品としては配らない）
- 完了条件: OS がライトのままでも、属性で Astryx の部品と Tailwind の部分の両方がダークになる
- 結果（2026-11-27）: 完了。独自の `data-color-scheme` はやめ、Astryx の `<Theme mode>` が付ける `html[data-theme]` にそろえた（テーマの CSS はもともとこの属性で切り替わる）。`dist/tailwind.css` に `@custom-variant dark` を足し、`dark:` が `data-theme` と OS の設定の両方に従うようにした。切り替えは K3 で付けた見本ページの `SegmentedControl` と `?mode=` をそのまま使う。OS がライト／ダーク × `?mode=` なし／light／dark／system の8通りで、Astryx のボタン・Tailwind のカードの背景・`dark:` の表示が、どれも期待どおりに切り替わることを確かめた

## K6. a2ui-mini 用のテーマを作る

- 依存: K5
- やること:
  - `--like kawasemi --accent <深い緑>` で `a2ui-mini` のテーマを作る。コントラストの確認を通る色に調整する
  - 生成物を `dist/themes/a2ui-mini.css` に出す
  - 見本ページでテーマを切り替えられるようにする
  - プロジェクトごとのテーマの作り方の手順を README に書く
- 完了条件: 見本ページで `kawasemi` と `a2ui-mini` を切り替えられ、ライト／ダークの両方で Tailwind の部分のアクセント色も変わる
- 結果（2026-11-27）: 完了。アクセントは `#2f5d46`（理由と生成された色は spec.md の「a2ui-mini の色」）。エディタの `new --like` は組み込みテーマしか受けず `--like kawasemi` は使えなかったので、kawasemi の設定を読んで同じ設定で `new` と `set` を呼ぶ `pnpm new-theme`（`scripts/new-theme.mjs`）を足した。作ったテーマの設定は、アクセント色以外 kawasemi と同じことを差分で確かめた。見本ページで2つのテーマ × ライト／ダークを撮り、Astryx のボタンと Tailwind のボタンの背景が4通りとも同じ色で切り替わることを確かめた。エディタが書く `themes/*/sheet.html` は `.gitignore` に足した

## K7. スクリーンショット比較を入れる

- 依存: K6
- やること:
  - Playwright で「テーマ（2つ）× ライト／ダーク」の4枚を撮って比べるテストを書く
  - 手元（Mac）で回せるようにする（基準画像は K8 で Linux のものに置き換える）
- 完了条件: `pnpm test` で4枚の比較が通り、テーマの色を1つ変えると失敗する
- 結果（2026-11-27）: 完了。`tests/screenshots.spec.ts` が見本ページを `?theme=` と `?mode=` で開いて全体を撮る（OS の設定はライトに固定し、ダークは `data-theme` で切り替える）。`playwright.config.ts` の `webServer` で見本ページをビルドして `vite preview` で出す。基準画像は `tests/screenshots/<テーマ>-<モード>-<OS>.png`。色の差の許容は 0 にした（既定の 0.2 や 0.02 では、エディタで a2ui-mini のアクセントを `#2f5d46` → `#2f6046` にしても通った。0 では a2ui-mini の2枚が約 15,000 画素の差で落ち、戻すと通った）。同じ環境で3回続けて回して安定していた。今コミットした基準画像はこの作業環境（Linux、Playwright 1.63 付属の Chromium）で撮ったもので、K8 の手動ワークフローで GitHub Actions の Linux のものに撮り直す。Playwright の版と合うブラウザがない環境では `PW_CHROMIUM_PATH` でブラウザの場所を渡せる。Mac では基準画像がないので、手元で回すときは `pnpm test:update` で `-darwin` の画像を作る（コミットはしない）

## K8. GitHub Actions で確認を回す

- 依存: K7、K1 の push
- やること:
  - プルリクエストごとに Biome・型チェック・スクリーンショット比較を回すワークフロー
  - 基準画像を Linux で撮り直してコミットする、手動で動かすワークフロー
- 完了条件: プルリクエストでワークフローが通り、わざと色を変えたプルリクエストでは失敗する
- 結果（2026-11-27）: ワークフローを書いた。`check.yml` はプルリクエストと main への push で、`dist/themes/` が最新か・Biome・型チェック（`pnpm typecheck`）・スクリーンショット比較を回し、落ちたら差分の画像を artifact に残す。`update-screenshots.yml` は基準画像を撮り直してブランチにコミットする。`workflow_dispatch` は main にファイルがないと動かせないので、プルリクエストに `update-screenshots` ラベルを付けたときにも動くようにした。撮り直しのコミット（github-actions[bot] の push）では `check.yml` が承認待ち（action_required）で止まるので、撮り直したあとは次の push で確認を回すか、Actions の画面で承認する。「わざと色を変えたプルリクエストで失敗する」は、作業ブランチ以外に push しない約束のため試していない（手元では K7 で確かめた）。プルリクエスト（akicraft/kawasemi#1）では、作業環境で撮った基準画像で check が4枚とも落ち（Biome・型チェック・`dist/` の確認は通過）、`update-screenshots` ラベルで撮り直した Linux の画像がブランチに積まれた。`actions/upload-artifact@v4` と `pnpm/action-setup@v4` に Node.js 20 の非推奨の警告が出ている

## K9. エージェント向けの説明書と README を書く

- 依存: K6
- やること:
  - `AGENTS.md`（spec.md の「エージェント向けの説明書」の内容）。`package.json` の `files` に含める
  - README: 目的、入れ方（`pnpm add github:akicraft/kawasemi#<タグ>`）、読み込み方、テーマの作り方、バージョンの付け方
- 完了条件: 空の Void プロジェクトに入れて、Claude に「設定画面を作って」と頼むと、`AGENTS.md` を読んで Astryx の部品とトークンで組む
- 結果（2026-11-27）: `AGENTS.md` と README を書いた。完了条件の「空の Void プロジェクトで試す」はまだ（タグがなく `github:` で入れられないため。v0.1.0 のあとに本人が試す）。spec の「`astryx how <部品名>` で引く」は、0.7.16 の CLI に `how` がなかったので `astryx search` と `astryx component <部品名>` に直した（`how` はテーマエディタの中にだけある）。アプリ側には CLI がないことが多いので、`@astryxdesign/cli` を devDependencies に入れるよう書いた
- 追記（2026-11-28）: 完了条件を確かめた。`void init`（React・静的ページの starter）で作った空のアプリに README の手順で入れ、`CLAUDE.md` に「UI は `node_modules/kawasemi/AGENTS.md` に従う。」の1行だけを足して、別セッションの Claude に「設定画面を作って」と頼んだ。AGENTS.md どおり、Tailwind の入口とテーマの CSS、`InternationalizationProvider`（ja-JP）と `<Theme mode>` を組み込み、画面は Astryx の部品とトークンのクラスだけで組んだ（色や px の直接指定なし）。ブラウザで、保存でダークに切り替わり通知が出ることを確かめた（akicraft/playground の `experiments/20261128-kawasemi-void`）。README の手順に2つ抜けがあったので直した: Astryx のインストール時スクリプトを `allowBuilds` で止める設定がないと pnpm がインストールを止めること、Tailwind の Vite プラグインを `vite.config.ts` に足すこと

## K10. v0.1.0 を出し、a2ui-mini で使う

- 依存: K8、K9
- やること:
  - `v0.1.0` のタグを打つ（**push は確認のうえで実施**）
  - a2ui-mini に `github:akicraft/kawasemi#v0.1.0` を入れ、`a2ui-mini` のテーマを読み込む
  - a2ui-mini の中に、kawasemi のトークンを `--a2ui-*` に写す CSS を書く（spec.md の「A2UI」）
  - a2ui-mini の `globals.css` の独自の色指定をやめる
- 完了条件: a2ui-mini の予約フォームが kawasemi（深い緑）の見た目で表示され、ライト／ダークも切り替わる
- 結果（2026-11-28）: 完了。`v0.1.0` のタグを push し、a2ui-mini（akicraft/playground の `a2ui-mini` ブランチ、b82c9c6）に入れた。予約フォーム → 予約 → 確認のカードまで、ライト／ダークの両方で深い緑の見た目になることを確かめた。`--a2ui-*` に写す CSS は a2ui-mini の `app/a2ui-kawasemi.css`。分かったこと: A2UI は Shadow DOM を使わないので、Astryx のリセットが A2UI の中の `<p>` に本文の色を付け、ボタンの白い文字が暗くなる（`color: inherit` で直した）。`kawasemi/a2ui.css` に移すときもこの対策を入れる
