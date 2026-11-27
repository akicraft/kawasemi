// 見本ページで切り替えるテーマ。使う側と同じく kawasemi/themes/<名前> から読み込む
import { a2uiMiniTheme } from "kawasemi/themes/a2ui-mini";
import { kawasemiTheme } from "kawasemi/themes/kawasemi";

export const themes = {
	kawasemi: kawasemiTheme,
	"a2ui-mini": a2uiMiniTheme,
};

export type ThemeName = keyof typeof themes;
