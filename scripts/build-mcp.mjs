// MCP サーバー（akicraft/mcp）に同梱するデータを dist/mcp/ に書き出す。
// サーバーは実行時に外へ通信せず、ここで作ったファイルをそのまま返す。
// 入力: AGENTS.md・package.json・dist/themes/<名前>/<名前>.css・themes/<名前>/<名前>.settings.json・
//       @astryxdesign/core の astryx.css（テーマが上書きしないトークンの既定値）・@astryxdesign/cli の出力
// Node の標準モジュールだけで書く。
import { execFileSync } from "node:child_process";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

const out = "dist/mcp";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const corePkgPath = "node_modules/@astryxdesign/core/package.json";
const corePkg = JSON.parse(readFileSync(corePkgPath, "utf8"));
const cliPkgPath = "node_modules/@astryxdesign/cli/package.json";
const cliPkg = JSON.parse(readFileSync(cliPkgPath, "utf8"));

// テーマの短い説明（README の「テーマ」の表と同じ内容）。テーマを足したらここにも足す
const descriptions = {
	kawasemi: "カワセミの青。土台のテーマ",
	"a2ui-mini": "製本クロスのような深い緑。a2ui-mini 用",
};

// 書き出すトークンの接頭辞
const tokenPrefixes = [
	"--color-",
	"--radius-",
	"--font-",
	"--text-",
	"--spacing-",
];

// ---------------------------------------------------------------- CSS の読み取り

// CSS を「囲んでいる @ 規則の並び・セレクター・宣言」の一覧にする（入れ子の @layer / @scope / @media に対応）
function parseCss(css) {
	const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
	const rules = [];
	const stack = [];
	let buf = "";
	let i = 0;
	while (i < text.length) {
		const ch = text[i];
		if (ch === "{") {
			const prelude = buf.trim();
			buf = "";
			if (prelude.startsWith("@")) {
				stack.push(prelude);
				i++;
				continue;
			}
			// 宣言のブロック。括弧の中の「;」や「}」を気にせず、次の「}」まで読む
			let depth = 0;
			let j = i + 1;
			let body = "";
			for (; j < text.length; j++) {
				const c = text[j];
				if (c === "(") depth++;
				else if (c === ")") depth--;
				else if (c === "}" && depth === 0) break;
				body += c;
			}
			rules.push({
				at: [...stack],
				selector: prelude,
				decls: parseDecls(body),
			});
			i = j + 1;
			continue;
		}
		if (ch === "}") {
			stack.pop();
			buf = "";
			i++;
			continue;
		}
		if (ch === ";" && buf.trim().startsWith("@")) {
			buf = "";
			i++;
			continue;
		}
		buf += ch;
		i++;
	}
	return rules;
}

function parseDecls(body) {
	const decls = [];
	let depth = 0;
	let cur = "";
	for (const c of body) {
		if (c === "(") depth++;
		else if (c === ")") depth--;
		if (c === ";" && depth === 0) {
			pushDecl(decls, cur);
			cur = "";
		} else cur += c;
	}
	pushDecl(decls, cur);
	return decls;
}

function pushDecl(decls, raw) {
	const k = raw.indexOf(":");
	if (k < 0) return;
	const name = raw.slice(0, k).trim();
	const value = raw.slice(k + 1).trim();
	if (name.startsWith("--")) decls.push([name, value]);
}

// ---------------------------------------------------------------- 値の解決

// 関数呼び出し name(...) の引数を、括弧の対応を見てトップレベルの「,」で分ける
function replaceFn(value, fn, cb) {
	let result = "";
	let i = 0;
	const re = new RegExp(`(^|[^\\w-])${fn}\\(`, "g");
	for (;;) {
		re.lastIndex = i;
		const m = re.exec(value);
		if (!m) break;
		const start = m.index + m[1].length;
		let depth = 0;
		let j = start + fn.length;
		const args = [];
		let cur = "";
		for (; j < value.length; j++) {
			const c = value[j];
			if (c === "(") {
				depth++;
				if (depth === 1) continue;
			} else if (c === ")") {
				depth--;
				if (depth === 0) break;
			} else if (c === "," && depth === 1) {
				args.push(cur.trim());
				cur = "";
				continue;
			}
			cur += c;
		}
		args.push(cur.trim());
		result += value.slice(i, start) + cb(args);
		i = j + 1;
	}
	return result + value.slice(i);
}

function hasFn(value, fn) {
	return new RegExp(`(^|[^\\w-])${fn}\\(`).test(value);
}

// light-dark(a, b) をモードの側に分ける（入れ子にも対応）
function pickMode(value, mode) {
	let v = value;
	while (hasFn(v, "light-dark")) {
		v = replaceFn(v, "light-dark", ([a, b]) => (mode === "light" ? a : b));
	}
	return v;
}

// var(--x) / var(--x, 既定) を解決する。解決できないものはそのまま残す
function resolveVars(value, mode, vars, seen = new Set()) {
	if (!hasFn(value, "var")) return value;
	return replaceFn(value, "var", ([name, ...rest]) => {
		const fallback = rest.length ? rest.join(", ") : undefined;
		if (vars.has(name) && !seen.has(name)) {
			const next = new Set(seen).add(name);
			return resolveVars(pickMode(vars.get(name), mode), mode, vars, next);
		}
		if (fallback !== undefined) return resolveVars(fallback, mode, vars, seen);
		return `var(${name})`;
	});
}

// rem や数値だけの calc() / min() を計算する（文字の大きさの式を 0.875rem のような値にする）
function simplify(value) {
	const num = /^(-?\d*\.?\d+)(rem|px|)$/;
	let v = value;
	for (let pass = 0; pass < 20; pass++) {
		const before = v;
		v = replaceFn(v, "calc", (args) => {
			const expr = args.map(simplify).join(", ");
			const m = expr.match(
				/^(-?\d*\.?\d+)(rem|px|)\s*\*\s*(-?\d*\.?\d+)(rem|px|)$/,
			);
			if (m && !(m[2] && m[4]))
				return format(Number(m[1]) * Number(m[3]), m[2] || m[4]);
			return num.test(expr) ? expr : `calc(${expr})`;
		});
		v = replaceFn(v, "min", (raw) => {
			const args = raw.map(simplify);
			const parsed = args.map((a) => a.match(num));
			if (
				parsed.every(Boolean) &&
				new Set(parsed.map((p) => p[2])).size === 1
			) {
				return format(
					Math.min(...parsed.map((p) => Number(p[1]))),
					parsed[0][2],
				);
			}
			return `min(${args.join(", ")})`;
		});
		if (v === before) break;
	}
	return v;
}

function format(n, unit) {
	return `${Number(n.toFixed(4))}${unit}`;
}

// ---------------------------------------------------------------- テーマ

// Astryx の既定値（:root。@media の中は除く）。テーマが上書きしないトークン（余白・太さなど）の出どころ
const coreCssPath = join(dirname(corePkgPath), "dist", "astryx.css");
const coreVars = new Map();
for (const rule of parseCss(readFileSync(coreCssPath, "utf8"))) {
	if (rule.at.some((a) => a.startsWith("@media"))) continue;
	if (!rule.selector.split(",").some((s) => s.trim() === ":root")) continue;
	for (const [name, value] of rule.decls) coreVars.set(name, value);
}

function themeVars(name) {
	const css = readFileSync(join("dist/themes", name, `${name}.css`), "utf8");
	const vars = new Map(coreVars);
	for (const rule of parseCss(css)) {
		// テーマの本体（@layer astryx-theme > @scope > :scope）。画面の幅で変わる値（@media）と
		// 写真の上などの [data-astryx-media] は除く
		if (rule.selector !== ":scope") continue;
		if (rule.at.some((a) => a.startsWith("@media"))) continue;
		if (!rule.at.some((a) => a.startsWith("@scope"))) continue;
		for (const [k, v] of rule.decls) vars.set(k, v);
	}
	return vars;
}

function tokensFor(vars, mode) {
	const tokens = {};
	const names = [...vars.keys()]
		.filter((n) => tokenPrefixes.some((p) => n.startsWith(p)))
		.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
	for (const n of names) {
		tokens[n] = simplify(resolveVars(pickMode(vars.get(n), mode), mode, vars));
	}
	return tokens;
}

function camel(name) {
	return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function accentOf(name) {
	const settings = JSON.parse(
		readFileSync(join("themes", name, `${name}.settings.json`), "utf8"),
	);
	return settings.settings.find((s) => s.thing === "accent")?.value;
}

const themeNames = readdirSync("dist/themes").sort();
const themes = themeNames.map((name) => {
	const vars = themeVars(name);
	return {
		name,
		accent: accentOf(name),
		description: descriptions[name] ?? "",
		css: `kawasemi/themes/${name}.css`,
		js: { import: `kawasemi/themes/${name}`, export: `${camel(name)}Theme` },
		tokens: { light: tokensFor(vars, "light"), dark: tokensFor(vars, "dark") },
	};
});

// ---------------------------------------------------------------- 入れ方

const astryxRange = pkg.peerDependencies["@astryxdesign/core"];
const tag = `v${pkg.version}`;

function setupFor(theme) {
	const exportName = theme.js.export;
	return {
		theme: theme.name,
		tag,
		install: {
			pnpmWorkspace: {
				file: "pnpm-workspace.yaml",
				note: "Astryx のインストール時スクリプトを走らせない。書かないと pnpm がインストールを止める。astryx init は実行しない",
				allowBuilds: {
					"@astryxdesign/core": false,
					"@astryxdesign/cli": false,
				},
				yaml: 'allowBuilds:\n  "@astryxdesign/core": false\n  "@astryxdesign/cli": false\n',
			},
			commands: [
				`pnpm add github:akicraft/kawasemi#${tag}`,
				`pnpm add @astryxdesign/core@${astryxRange} @astryxdesign/theme-neutral@${astryxRange} @stylexjs/stylex react react-dom`,
				`pnpm add -D @astryxdesign/cli@${astryxRange}`,
			],
			tailwind: {
				note: "Tailwind を使うときだけ（v4.3 以上）。vite.config.ts の plugins に足す",
				commands: ["pnpm add -D tailwindcss @tailwindcss/vite"],
				viteConfig:
					'import tailwindcss from "@tailwindcss/vite";\n\nexport default defineConfig({\n\tplugins: [tailwindcss() /* , ほかのプラグイン */],\n});\n',
			},
		},
		css: {
			note: "アプリの入口の CSS。テーマはプロジェクトで使う1つだけ。フォント（Noto Sans JP）は kawasemi の CSS が読み込むので <link> や @font-face を書かない",
			tailwind: `@import "kawasemi/tailwind.css";\n@import "${theme.css}";\n`,
			plain: `@import "kawasemi/base.css";\n@import "${theme.css}";\n`,
		},
		root: {
			note: 'アプリの一番外側。InternationalizationProvider を外すと部品の中の文言が英語になる。ダークモードは mode="light" | "dark" | "system"',
			code: [
				'import { InternationalizationProvider } from "@astryxdesign/core/i18n";',
				'import jaJP from "@astryxdesign/core/locales/ja-JP.generated.js";',
				'import { Theme } from "@astryxdesign/core/theme";',
				`import { ${exportName} } from "${theme.js.import}";`,
				"",
				"export function Root({ children }: { children: React.ReactNode }) {",
				"\treturn (",
				'\t\t<InternationalizationProvider locale="ja-JP" messages={{ "ja-JP": jaJP }}>',
				`\t\t\t<Theme theme={${exportName}} mode="system">`,
				"\t\t\t\t{children}",
				"\t\t\t</Theme>",
				"\t\t</InternationalizationProvider>",
				"\t);",
				"}",
				"",
			].join("\n"),
		},
		agents: {
			note: "プロジェクトの CLAUDE.md に足す1行",
			line: "UI は `node_modules/kawasemi/AGENTS.md` に従う。",
		},
	};
}

// ---------------------------------------------------------------- 部品

const cliBin = join(
	dirname(cliPkgPath),
	typeof cliPkg.bin === "string" ? cliPkg.bin : cliPkg.bin.astryx,
);

function astryx(args) {
	const stdout = execFileSync(process.execPath, [cliBin, ...args], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		stdio: ["ignore", "pipe", "ignore"],
	});
	return JSON.parse(stdout);
}

function buildComponents() {
	const list = astryx(["component", "--list", "--json"]);
	const names = Object.values(list.data.components)
		.flat()
		.filter((c) => c.package === "@astryxdesign/core")
		.map((c) => c.name);
	const details = [];
	// CLI は1回に100個まで
	for (let i = 0; i < names.length; i += 100) {
		const batch = astryx(["component", ...names.slice(i, i + 100), "--json"]);
		for (const row of batch.data.results) {
			if (row.status !== "found")
				throw new Error(`部品が見つからない: ${row.selector}`);
			details.push(row.result.data);
		}
	}
	const components = {};
	for (const d of details) {
		// playground は見本ページの初期値なので入れない
		const { playground: _playground, ...rest } = d;
		components[d.name] = {
			...rest,
			summary: d.description ?? d.usage?.description ?? "",
			importStatement: `import { ${d.name} } from "${d.import}";`,
		};
	}
	return {
		astryx: corePkg.version,
		source: `@astryxdesign/cli@${cliPkg.version} component --json`,
		count: details.length,
		index: details.map((d) => ({
			name: d.name,
			group: d.group,
			category: d.category,
			import: d.import,
			summary: components[d.name].summary,
			keywords: d.keywords ?? [],
		})),
		components,
	};
}

// ---------------------------------------------------------------- 書き出し

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

function write(file, data) {
	const text =
		typeof data === "string" ? data : `${JSON.stringify(data, null, "\t")}\n`;
	writeFileSync(join(out, file), text);
	console.log(join(out, file));
}

write("guide.md", readFileSync("AGENTS.md", "utf8"));
write("themes.json", { astryx: corePkg.version, themes });
write("setup.json", {
	kawasemi: pkg.version,
	astryx: astryxRange,
	themes: Object.fromEntries(themes.map((t) => [t.name, setupFor(t)])),
});
write("components.json", buildComponents());
write("meta.json", {
	kawasemi: pkg.version,
	astryx: {
		core: corePkg.version,
		cli: cliPkg.version,
		peerRange: astryxRange,
	},
	themes: themeNames,
	files: [
		"guide.md",
		"themes.json",
		"setup.json",
		"components.json",
		"meta.json",
	],
});
