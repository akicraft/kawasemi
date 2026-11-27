// プロジェクトごとのテーマを、土台 kawasemi と同じ設定・違うアクセント色で作る。
//
//   pnpm new-theme <名前> <アクセント色>
//   例: pnpm new-theme a2ui-mini "#2f5d46"
//
// テーマエディタの `new --like` は組み込みテーマ（neutral など）しか受けないので、
// themes/kawasemi/kawasemi.settings.json を読み、同じ設定をエディタに渡し直す。
// 設定ファイルは読むだけで、書くのはエディタ（new と set）に任せる。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const [name, accent] = process.argv.slice(2);
if (!name || !accent) {
	console.error(
		'使い方: pnpm new-theme <名前> <アクセント色>（例: a2ui-mini "#2f5d46"）',
	);
	process.exit(1);
}
if (existsSync(`themes/${name}`)) {
	console.error(`themes/${name} はもうある。色を変えるときは次を使う:`);
	console.error(
		`  pnpm exec astryx experimental theme editor set ${name} accent "${accent}"`,
	);
	process.exit(1);
}

const base = JSON.parse(
	readFileSync("themes/kawasemi/kawasemi.settings.json", "utf8"),
);

const dials = [];
const tokens = [];
for (const s of base.settings) {
	// 部品ごと・モードごとの設定はまだ kawasemi にない。増えたらここで渡し方を足す
	const extra = Object.keys(s).filter(
		(k) => !["thing", "value", "source", "axis"].includes(k),
	);
	if (extra.length > 0) {
		throw new Error(`この設定の渡し方が未対応: ${JSON.stringify(s)}`);
	}
	if (s.source === "dial") {
		dials.push(`--${s.thing}`, s.thing === "accent" ? accent : s.value);
	} else if (s.source === "token") {
		tokens.push([s.thing, s.value]);
	} else {
		throw new Error(`この設定の渡し方が未対応: ${JSON.stringify(s)}`);
	}
}

const editor = (...args) => {
	console.log(`> astryx experimental theme editor ${args.join(" ")}`);
	execFileSync(
		"pnpm",
		["exec", "astryx", "experimental", "theme", "editor", ...args],
		{ stdio: "inherit" },
	);
};

editor("new", name, "--like", base.like, "--mode", base.mode, ...dials);
for (const [thing, value] of tokens) {
	editor("set", name, thing, value);
}
console.log(`\nできた。次に pnpm build で dist/themes/${name}/ を作る`);
