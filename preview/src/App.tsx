import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import jaJP from "@astryxdesign/core/locales/ja-JP.generated.js";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Section } from "@astryxdesign/core/Section";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Selector } from "@astryxdesign/core/Selector";
import { Switch } from "@astryxdesign/core/Switch";
import { pixel, proportional, Table } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Theme } from "@astryxdesign/core/theme";
import { VStack } from "@astryxdesign/core/VStack";
import { useState } from "react";
import { type ThemeName, themes } from "./themes";

type Mode = "system" | "light" | "dark";

// URL の ?theme= と ?mode= で初期状態を決める（スクリーンショットで使う）
function fromQuery<T extends string>(
	key: string,
	allowed: readonly T[],
	fallback: T,
): T {
	const v = new URLSearchParams(location.search).get(key);
	return allowed.includes(v as T) ? (v as T) : fallback;
}

const themeNames = Object.keys(themes) as ThemeName[];

interface Booking extends Record<string, unknown> {
	id: string;
	date: string;
	name: string;
	people: number;
	status: "確定" | "保留" | "取消";
}

const bookings: Booking[] = [
	{ id: "1", date: "12/3（水）18:00", name: "山田", people: 2, status: "確定" },
	{
		id: "2",
		date: "12/4（木）15:00",
		name: "佐々木",
		people: 4,
		status: "保留",
	},
	{ id: "3", date: "12/6（土）12:30", name: "高橋", people: 1, status: "取消" },
];

const statusVariant = {
	確定: "success",
	保留: "warning",
	取消: "neutral",
} as const;

export function App() {
	const [themeName, setThemeName] = useState<ThemeName>(() =>
		fromQuery("theme", themeNames, "kawasemi"),
	);
	const [mode, setMode] = useState<Mode>(() =>
		fromQuery("mode", ["system", "light", "dark"] as const, "system"),
	);

	return (
		<InternationalizationProvider locale="ja-JP" messages={{ "ja-JP": jaJP }}>
			<Theme theme={themes[themeName]} mode={mode}>
				<Section variant="muted" padding={3} dividers={["bottom"]}>
					<HStack hAlign="between" vAlign="center" gap={4}>
						<Heading level={1}>kawasemi 見本</Heading>
						<HStack gap={3} vAlign="center">
							<Selector
								label="テーマ"
								isLabelHidden
								options={themeNames}
								value={themeName}
								onChange={(v) => setThemeName(v as ThemeName)}
							/>
							<SegmentedControl
								label="表示モード"
								value={mode}
								onChange={(v) => setMode(v as Mode)}
							>
								<SegmentedControlItem value="system" label="OS に従う" />
								<SegmentedControlItem value="light" label="ライト" />
								<SegmentedControlItem value="dark" label="ダーク" />
							</SegmentedControl>
						</HStack>
					</HStack>
				</Section>
				<Section padding={6}>
					<VStack gap={8} maxWidth={1080}>
						<Typography />
						<Divider />
						<Actions />
						<Divider />
						<Form />
						<Divider />
						<Status />
						<Divider />
						<Bookings />
					</VStack>
				</Section>
			</Theme>
		</InternationalizationProvider>
	);
}

function Typography() {
	return (
		<VStack gap={2}>
			<Heading level={2}>文字</Heading>
			<Text type="large" display="block">
				予約の受付は前日の 20:00 までです。
			</Text>
			<Text display="block">
				本文は Noto Sans JP
				の可変フォントで表示します。漢字・ひらがな・カタカナ・English・1234567890
				が同じ行に並んでも、高さと太さがそろうことを確かめます。
			</Text>
			<Text type="supporting" display="block">
				補足の文字は少し薄く、小さくなります。
			</Text>
		</VStack>
	);
}

function Actions() {
	return (
		<VStack gap={3}>
			<Heading level={2}>ボタン</Heading>
			<HStack gap={2} vAlign="center">
				<Button variant="primary" label="予約する" />
				<Button label="下書きに保存" />
				<Button variant="ghost" label="やめる" />
				<Button variant="destructive" label="予約を取り消す" />
				<Button variant="primary" label="送信中" isLoading />
				<Button label="選べない" isDisabled />
			</HStack>
			<HStack gap={2} vAlign="center">
				<Button size="sm" variant="primary" label="小" />
				<Button size="md" variant="primary" label="中" />
				<Button size="lg" variant="primary" label="大" />
			</HStack>
		</VStack>
	);
}

function Form() {
	const [name, setName] = useState("山田 花子");
	const [people, setPeople] = useState("2");
	const [seat, setSeat] = useState("table");
	const [notify, setNotify] = useState(true);
	const [agree, setAgree] = useState(false);
	const [email, setEmail] = useState("");
	return (
		<VStack gap={3}>
			<Heading level={2}>入力</Heading>
			<HStack gap={6} vAlign="start">
				<VStack gap={4} width={360}>
					<TextInput
						label="お名前"
						value={name}
						onChange={setName}
						isRequired
					/>
					<TextInput
						label="メールアドレス"
						type="email"
						value={email}
						onChange={setEmail}
						description="確認のメールを送ります"
						isOptional
					/>
					<Selector
						label="人数"
						options={["1", "2", "3", "4"].map((n) => ({
							value: n,
							label: `${n}名`,
						}))}
						value={people}
						onChange={setPeople}
					/>
				</VStack>
				<VStack gap={4} width={360}>
					<RadioList label="席" value={seat} onChange={setSeat}>
						<RadioListItem value="table" label="テーブル席" />
						<RadioListItem value="counter" label="カウンター席" />
						<RadioListItem value="terrace" label="テラス席" />
					</RadioList>
					<Switch
						label="前日にお知らせする"
						value={notify}
						onChange={setNotify}
					/>
					<CheckboxInput
						label="キャンセル規定に同意する"
						value={agree}
						onChange={setAgree}
					/>
				</VStack>
			</HStack>
		</VStack>
	);
}

function Status() {
	return (
		<VStack gap={3}>
			<Heading level={2}>状態</Heading>
			<Banner
				status="info"
				title="年末年始の営業"
				description="12/30〜1/3 はお休みします。"
			/>
			<Banner
				status="warning"
				title="残りわずか"
				description="12/6（土）の夜は、あと2席です。"
			/>
			<HStack gap={2} vAlign="center">
				<Badge variant="success" label="確定" />
				<Badge variant="warning" label="保留" />
				<Badge variant="error" label="失敗" />
				<Badge variant="info" label="お知らせ" />
				<Badge variant="neutral" label="取消" />
				<Badge variant="blue" label="ランチ" />
				<Badge variant="green" label="ディナー" />
			</HStack>
			<VStack gap={2} width={360}>
				<ProgressBar label="今月の予約" value={64} hasValueLabel />
				<ProgressBar
					label="仕込み"
					value={90}
					variant="success"
					hasValueLabel
				/>
			</VStack>
		</VStack>
	);
}

function Bookings() {
	return (
		<VStack gap={3}>
			<Heading level={2}>表とカード</Heading>
			<Table<Booking>
				data={bookings}
				idKey="id"
				columns={[
					{ key: "date", header: "日時", width: proportional(2) },
					{ key: "name", header: "お名前", width: proportional(1) },
					{
						key: "people",
						header: "人数",
						width: pixel(80),
						align: "end",
						renderCell: (b) => `${b.people}名`,
					},
					{
						key: "status",
						header: "状態",
						width: pixel(100),
						renderCell: (b) => (
							<Badge variant={statusVariant[b.status]} label={b.status} />
						),
					},
				]}
			/>
			<HStack gap={4} vAlign="stretch">
				<Card width={320}>
					<VStack gap={2}>
						<Heading level={3}>山田 花子 さま</Heading>
						<Text type="supporting">12/3（水）18:00・2名・テーブル席</Text>
						<HStack gap={2}>
							<Button size="sm" variant="primary" label="確定する" />
							<Button size="sm" variant="ghost" label="連絡する" />
						</HStack>
					</VStack>
				</Card>
				<Card width={320} variant="muted">
					<VStack gap={2}>
						<Heading level={3}>今日の空き</Heading>
						<Text type="supporting">ランチ 6席・ディナー 2席</Text>
					</VStack>
				</Card>
			</HStack>
		</VStack>
	);
}
