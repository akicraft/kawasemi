// テーマエディタの生成物（src/themes/<名前>/）を配布用の dist/themes/<名前>/ にコピーする。
// 生成物は手で編集しないので、ここでは中身を変えずにコピーだけする。
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = "src/themes";
const out = "dist/themes";
const kinds = [".css", ".js", ".d.ts", ".css.d.ts", ".variants.d.ts"];

rmSync(out, { recursive: true, force: true });
for (const name of readdirSync(src)) {
	mkdirSync(join(out, name), { recursive: true });
	for (const kind of kinds) {
		cpSync(join(src, name, name + kind), join(out, name, name + kind));
	}
	console.log(`dist/themes/${name}/`);
}
