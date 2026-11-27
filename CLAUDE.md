# kawasemi — 開発するときのルール

Astryx をベースにした個人開発用のデザインシステム。仕様は [docs/spec.md](docs/spec.md)、作業の順番は [docs/tickets.md](docs/tickets.md)。

このファイルは kawasemi 自体を開発するときのもの。kawasemi を**使う側**のエージェント向けの説明は `AGENTS.md`（K9 で書く）。

## 守ること

- テーマは Astryx のテーマエディタ（`pnpm exec astryx experimental theme editor ...`）で作る。生成物（`themes/`・`src/themes/`・`dist/themes/`）は手で編集しない
- テーマを変えたら `pnpm build` で `dist/themes/` を作り直し、一緒にコミットする
- 色や数値は、Tailwind 用の CSS でも見本ページでも直接書かず、Astryx のトークン（CSS 変数）を参照する
- `dist/` の生成物はコミットする（Git から入れるパッケージでは、pnpm がビルドスクリプトを走らせないため）
- 依存は npm の7日ルールに沿って、公開から7日以上たった版を入れる
- `@astryxdesign/core` は peerDependencies。範囲は確認済みの狭いもの（`~0.7.x`）にし、上げるときは見本ページの比較を通してから
- `astryx init` は実行しない（CLAUDE.md や AGENTS.md に部品一覧を書き込むため）
- タグの付け方: 色の調整は patch、トークンの追加は minor。0.x の間は、トークン名の変更や Astryx の範囲を上げる変更も minor

## コマンド

```sh
pnpm install
pnpm build     # src/themes/（エディタの生成物）を dist/themes/ にコピー。テーマを変えたら必ず実行
pnpm check     # Biome
pnpm format    # Biome で整形
pnpm --filter kawasemi-preview dev   # 見本ページ（http://localhost:5199）
```

## 開発環境のメモ

- node 24 系・pnpm 12.11.0（`mise.toml`）。手元に mise が無い場合は、入っている node / pnpm で動く
- Astryx の CLI は `npx` ではなく、devDependencies から `pnpm exec astryx` で実行する
