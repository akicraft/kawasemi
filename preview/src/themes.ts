// 見本ページで切り替えるテーマ。使う側と同じく kawasemi/themes/<名前> から読み込む
import { kawasemiTheme } from "kawasemi/themes/kawasemi";

export const themes = {
	kawasemi: kawasemiTheme,
};

export type ThemeName = keyof typeof themes;
