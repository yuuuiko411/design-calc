# Design Calc. v1.0

Webデザイナー・フロントエンド開発者のための、小さな計算道具。px / rem変換、余白スケール、文字サイズ、アスペクト比をブラウザで計算できます。

**[公開アプリを使う → https://yuuuiko411.github.io/design-calc/](https://yuuuiko411.github.io/design-calc/)**

インストール・アカウント登録は不要です。すぐに使いたい方は上の公開アプリを開いてください。[ソースコードはこちら](https://github.com/yuuuiko411/design-calc)。

## 目次

- [Quick start (clients) — アプリを使う](#quick-start-clients)
- [Features — 実装機能](#features)
- [Local development — ローカル開発](#local-development)
- [Deployment — 公開・更新](#deployment)
- [Configuration — 設定](#configuration)
- [構成と計算の扱い](#構成と計算の扱い)
- [検証](#検証)
- [既知の制約](#既知の制約)
- [今後の改善候補](#今後の改善候補)
- [Attribution — 使用技術・帰属](#attribution)
- [License — ライセンス](#license)

<a id="quick-start-clients"></a>

## Quick start (clients)

1. [公開アプリ](https://yuuuiko411.github.io/design-calc/)を開きます。
2. 使いたいツールを選び、数値や倍率・比率を入力します。結果は入力に合わせて更新されます。
3. 結果欄のコピーボタンで値やCSSをコピーし、制作中のデザインやコードへ貼り付けます。

| ツールへの直接リンク | 使い方の例 |
| --- | --- |
| [Unit Converter](https://yuuuiko411.github.io/design-calc/#unit) | rootを16px、値を24pxにすると `1.5rem` |
| [Spacing Scale](https://yuuuiko411.github.io/design-calc/#spacing) | 基準8pxから余白スケールを作り、CSSカスタムプロパティを一括コピー |
| [Type Scale](https://yuuuiko411.github.io/design-calc/#type) | 基準16px・倍率1.25で文字サイズの階層と実寸見本を確認 |
| [Aspect Ratio](https://yuuuiko411.github.io/design-calc/#aspect) | 16:9・幅1200pxから高さ675pxを計算 |

計算はブラウザ内で行い、入力値を送信する独自API・バックエンドはありません。入力はツールの切替中は保持されますが、再読み込みすると初期値に戻ります。コピーが許可されない場合は、結果を選択して手動でコピーしてください。

## Features

| ツール | 動作 | コピー形式 |
| --- | --- | --- |
| Unit Converter | px ⇄ rem。root 1〜100px、入力0〜1,000,000。最大小数4桁 | `1.5rem` |
| Spacing Scale | 基準1〜64px × 0.5 / 1 / 1.5 / 2 / 3 / 4 / 6 / 8。相対的な棒グラフとグリッド近似 | `--space-3: 24px;`等を8行まとめてコピー |
| Type Scale | 基準8〜64px。5種類の倍率、6階層。元の計算サイズで文字見本を表示 | `font-size: 25px;`等を個別コピー |
| Aspect Ratio | 5種類の比率。幅・高さ基準を切替。1〜100,000pxの整数。計算結果も範囲検証 | `1200px × 675px` |

- 入力と結果は即時連動。各ツールの入力は画面切替中も保持し、リロード時に初期化します。
- `#unit` / `#spacing` / `#type` / `#aspect`へ直接アクセス可能。ブラウザの戻る・進むに対応します。
- 不正入力はフィールドと結果欄に具体的なエラーを表示し、該当結果のコピーを無効化します。
- コピー成功・失敗は読み上げ対応の通知で伝えます。通知は閉じる操作も可能です。
- PCは入力・結果の2カラム、767px以下は1カラムです。
- ネイティブのリンク・ボタン・入力、スキップリンク、視認できるフォーカス、`aria-invalid` / `aria-describedby`、reduced motionに対応しています。

## Local development

Node.js 22.12以降（検証環境・GitHub Actions: Node.js 24）とnpmを用意してください。公開アプリを使うだけなら、この手順は不要です。

```sh
git clone https://github.com/yuuuiko411/design-calc.git
cd design-calc
npm ci
npm run dev
```

ターミナルに表示されたURLを開きます。通常は `http://127.0.0.1:5173` です。ポートが使用中の場合は、表示された実際のURLを利用してください。

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run lint` | ESLintで検査 |
| `npm run typecheck` | TypeScriptの型チェック |
| `npm test` | Vitestの計算・UIテストを実行 |
| `npm run test:watch` | Vitestを監視モードで実行 |
| `npm run test:browser` | 起動済みサーバーに対してChromeでブラウザ検証 |
| `npm run build` | 型チェック後、本番用ファイルを `dist/` に生成 |
| `npm run preview` | ビルド済みの `dist/` をローカルで確認（通常 `http://127.0.0.1:4173`） |

ブラウザ検証にはGoogle Chromeが必要です。別ターミナルで `npm run dev` を起動してから実行してください。検証対象URL・ブラウザの変更は [Configuration](#configuration) を参照してください。

## Deployment

### GitHub Pagesへの公開・更新

公開先は **[https://yuuuiko411.github.io/design-calc/](https://yuuuiko411.github.io/design-calc/)** です。このフォルダを単独リポジトリのルートとして扱います。

1. GitHubリポジトリの **Settings → Pages → Source** を **GitHub Actions** に設定します。
2. 変更をコミットして `main` へpushします。
3. [GitHub Actions](https://github.com/yuuuiko411/design-calc/actions)でワークフローの成功を確認し、公開URLを開きます。

[公開ワークフロー](.github/workflows/deploy.yml)はlint・型チェック・テスト・ビルドを順番に実行し、すべて成功した場合に `dist/` だけを公開します。Actions画面から手動実行（`workflow_dispatch`）も可能です。

ActionsはPagesの公開先から `PAGES_BASE_PATH` を設定し、JS・CSS・faviconをリポジトリ配下のURLで読み込めるようにします。`node_modules/`・`dist/`・`qa/artifacts/`・環境変数ファイルはGitの対象外です。

### その他の静的ホスティング

`npm ci` → `npm run build` を実行し、生成された `dist/` を静的ホスティングへ配置してください。ビルドにはNode.jsが必要ですが、配信時のアプリ用サーバー・DBは不要です。コピー機能を使えるよう、公開先はHTTPSを使用してください。

ドメイン直下に配置する場合、ベースパスの変更は不要です。サブディレクトリへ配置する場合は、ビルド前に `PAGES_BASE_PATH` を設定します。画面切替はURLハッシュを使うため、サーバー側のルーティング設定は不要です。

## Configuration

通常の利用・ローカル開発に必須の環境変数、APIキー、外部サービス設定はありません。

| 環境変数 | 既定値 | 用途 |
| --- | --- | --- |
| `PAGES_BASE_PATH` | `/` | Viteのベースパス。サブパスへ配信する場合は `/design-calc/` のように指定。GitHub Actionsでは自動設定 |
| `QA_URL` | `http://127.0.0.1:5173` | `npm run test:browser` の検証対象URL。サーバーは別途起動が必要 |
| `BROWSER_CHANNEL` | `chrome` | Playwrightで起動するブラウザチャンネル。指定するブラウザは事前にインストールが必要 |

`PAGES_BASE_PATH` はViteが読み込みます。`QA_URL` と `BROWSER_CHANNEL` はNode.jsの検証スクリプトが `process.env` から読むため、シェルの環境変数として設定してください。

サブパスでのローカル確認例（PowerShell）:

```powershell
$env:PAGES_BASE_PATH='/design-calc/'
npm run build
npm run preview
```

プレビューを起動したまま、別ターミナルでリポジトリのルートから実行します。

```powershell
$env:QA_URL='http://127.0.0.1:4173/design-calc/'
npm run test:browser
```

公開HTTPS URLにも同じブラウザ検証を実行できます。

```powershell
$env:QA_URL='https://yuuuiko411.github.io/design-calc/'
npm run test:browser
```

PowerShellで設定した環境変数は、そのターミナル内で維持されます。通常の設定へ戻す場合は新しいターミナルを開くか、対象の変数を削除してください。

```powershell
Remove-Item Env:PAGES_BASE_PATH -ErrorAction SilentlyContinue
Remove-Item Env:QA_URL -ErrorAction SilentlyContinue
Remove-Item Env:BROWSER_CHANNEL -ErrorAction SilentlyContinue
```

## 構成と計算の扱い

```text
src/
  lib/calculations.ts         純粋関数・型・入力検証・共通フォーマット
  lib/calculations.test.ts    仕様例・境界値・空欄・負数・非有限数のテスト
  components/ui/             必要なshadcn/uiプリミティブ
  components/shared.tsx      ラベル付き入力・パネル・コピー・数式・エラー
  features/                 4ツールの画面
  App.tsx                    ハッシュナビゲーション・通知
  App.test.tsx               入力・コピー・履歴・プレビュー等の操作テスト
  index.css                  デザイントークンとレスポンシブ表示
```

計算関数は`Result<T>`を返します。無効値はエラーとして扱い、NaNやInfinityを結果として表示しません。入力は文字列で保持し、空欄を0と誤認しません。指数表記は使用可能ですが、16進数等のJavaScript固有形式は拒否します。

表示の丸めは`formatNumber`へ集約し、元データを変更しません。一般的な二進浮動小数点誤差に対して相対epsilonを加えて丸め、末尾ゼロを除去します。内部計算はJavaScriptの倍精度数値です。

余白の近似は**全ての非負整数倍**を対象とし、8段階のスケールだけには限定しません。中間値では大きい倍数を選びます。近似入力の上限は実用上0〜1,000,000pxとしています。

比率切替では現在の固定辺を維持します。固定辺を切り替える場合は、現在の計算結果の整数pxを新しい入力値に引き継ぎます。四捨五入前の計算値が有効範囲外ならエラーにします。

## 検証

Vitestで主要な計算例に加えて、範囲の上下限、空欄、負数、NaN、Infinity、整数制約、近似の同距離・0・小数誤差、表示丸めを検証します。React Testing Libraryではリアルタイム更新、不正時のコピー禁止、コピー成功・失敗、履歴移動、画面切替時の入力保持、文字サイズと注意文、比率変更時の固定辺維持を検証します。

Chromeをインストールし、別ターミナルで`npm run dev`を起動した状態で`npm run test:browser`を実行すると、320 / 390 / 768 / 1440pxの4画面のスクリーンショット、axeによるWCAG A / AA対象の自動検査、コピー・履歴・縮尺・キーボード操作の実ブラウザ検証を実行します。出力は`qa/artifacts/`です。サーバーURLは`QA_URL`、ブラウザチャンネルは`BROWSER_CHANNEL`環境変数で変更できます。

2026-10-21の検証記録（既存の実装検証結果）:

- ESLint・TypeScript strict・本番ビルド: 成功。
- Vitest: 94件成功（計算83件、UI操作11件）。
- Chrome: 4画面 × 4画面幅でページの横はみ出しなし。スクリーンショット16枚を保存。
- axe: 初期画面16条件＋最大文字サイズ1条件の計17条件で対象ルールの違反0件。
- 最大値でのコピー、無効入力、履歴移動、実寸文字とキーボードスクロール、5比率の図形寸法、スキップリンク、reduced motionを確認。ページのJavaScriptエラー0件。
- ビルドとブラウザ等を同時実行した際に環境のメモリ不足が1回発生しました。終了後のビルド単独実行は成功しています。メモリに余裕がない環境ではチェックを順番に実行してください。

## 既知の制約

- クリップボードAPIはHTTPSまたはlocalhost等の安全なコンテキストで動作します。権限拒否・API非対応時は通知し、選択コピーを案内します。
- Type Scaleは見本を実寸表示します。大きい文字は見本の領域内で横スクロールできます。12px未満に注意文を表示しますが、12px以上でも可読性を保証するものではありません。
- Unit Converterの見本は8〜80pxに調整し、調整した場合は明記します。計算・コピー結果には影響しません。
- 棒グラフは最大倍率に対する相対表示です。アスペクト比の図も縮小表示で、実寸の画像は生成しません。
- OSのシステムフォントを使用するため、環境によって文字見本の字形・幅が変わります。外部フォントの取得はありません。
- WCAG 2.2 AAを目標に実装しています。正式な適合認証や全支援技術での検証を意味しません。
- 認証、DB、API、設定の永続保存、ダークモード、独自バックエンドはありません。

## 今後の改善候補

MVP後の候補として、スクリーンリーダー実機での追加検証と、CSS出力形式の選択が挙げられます。カスタム比率・任意階層・設定保存などは今回の実装には含めていません。

## Attribution

このアプリはReact + Vite + TypeScript strict + Tailwind CSS v4で実装しています。Button / Inputはshadcn/uiのパターンを参考にし、アイコンにはLucide Reactを使用しています。

| プロジェクト | このアプリでの用途 | ライセンス表記 |
| --- | --- | --- |
| [React / React DOM](https://github.com/facebook/react) | UIと描画 | MIT |
| [Vite](https://github.com/vitejs/vite) | 開発サーバー・ビルド | MIT |
| [TypeScript](https://github.com/microsoft/TypeScript) | 型チェック | Apache-2.0 |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | スタイル | MIT |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | UIコンポーネントの参考パターン | MIT |
| [Radix UI](https://github.com/radix-ui/primitives) | ButtonのSlot | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) | アイコン | ISC（一部Feather由来のMIT表記を含む） |
| [class-variance-authority](https://github.com/joe-bell/cva) | コンポーネントのバリアント | Apache-2.0 |
| [clsx](https://github.com/lukeed/clsx) / [tailwind-merge](https://github.com/dcastil/tailwind-merge) | CSSクラスの結合・調整 | MIT |

Lucideの著作権表記には、Feather由来の部分についてCole Bemis（2013–2022）、その他についてLucide Contributors（2022）が記載されています。

上記は主要な使用技術の一覧です。開発・検証用を含む依存関係は [package.json](package.json)、固定されたバージョンは [package-lock.json](package-lock.json) を参照してください。各依存パッケージのライセンス全文・著作権表示は、インストール済みパッケージに含まれる `LICENSE` / `NOTICE` 等を確認してください。

技術構成の参考: [Tailwind CSS / Vite](https://tailwindcss.com/docs/installation/using-vite)、[shadcn/ui / Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)。文字見本はOSのシステムフォントを使用し、外部フォントは取得していません。

## License

アプリのフッター表記: © Design Calc.（年は表示時の年）。

このリポジトリには現在、プロジェクト本体の `LICENSE` ファイルおよび利用許諾条件の明示がありません。本体の再利用・改変・再配布について確認が必要な場合は、[リポジトリの所有者](https://github.com/yuuuiko411)へお問い合わせください。

使用している第三者ライブラリ・アイコンのライセンスは、それぞれのプロジェクトに従います。[Attribution](#attribution) に記載したライセンスは依存技術のものであり、Design Calc.本体のライセンスを指定するものではありません。
