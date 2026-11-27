# kawasemi

[Astryx](https://astryx.atmeta.com/) をベースにした、個人開発用のデザインシステム。

- 文字・余白・形などの土台は共通で、アクセント色だけをプロジェクトごとに変えられる
- Tailwind CSS v4 からも同じトークンを使える
- Noto Sans JP を同梱し、ダークモードは OS の設定に連動する

まだ作っている途中で、リリースはありません。詳しくは [docs/spec.md](docs/spec.md) を参照。

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

## ライセンス

MIT
