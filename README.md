# ultradonguri-controller

React + TypeScript + Vite で構築されたコントローラ用フロントエンドです。開発環境の整備手順、コンポーネントの分け方、スタイル（色変数の必須利用）についての指針をまとめます。

## 必要環境

- Node.js
- npm
- または Docker

Node のバージョンは `node -v` で確認し、必要に応じて `nvm` 等で切り替えてください。

## セットアップ

### 通常の環境

1. リポジトリのクローン
   - `git clone https://github.com/sohosai/ultradonguri-controller.git`
2. 依存関係のインストール
   - `npm install`
3. 開発サーバ起動
   - `npm run dev`
   - ターミナルに表示される URL にアクセス

### Docker を使用する場合

1. リポジトリのクローン
   - `git clone https://github.com/sohosai/ultradonguri-controller.git`
2. Docker Compose で起動
   - `docker compose up`   
   - ターミナルに表示される URL にアクセス
## 開発コマンド

- Lint（ESLint）実行: `npm run eslint:check`
- Lint（ESLint 自動修正）: `npm run eslint`
- Stylelint 実行: `npm run stylelint:check`
- Stylelint 自動修正: `npm run stylelint`
- Prettier フォーマット: `npm run format`
- フォーマット検査: `npm run format:check`

## ディレクトリ構成とコンポーネント分割

- コンポーネントは以下の規則で配置します
  - ディレクトリ: `src/components/ComponentName/`
  - エントリ: `src/components/ComponentName/index.tsx`
  - スタイル（必要に応じて）: `src/components/ComponentName/index.module.css`

例: `Header` コンポーネント

```
src/
  components/
    Header/
      index.tsx
      index.module.css
```

TypeScript の型・ユーティリティは用途に応じ `src/types` 配下へ配置します。

## スタイル指針（色変数は必須）

- カラーは必ず CSS 変数を使用します（直書きのカラーコード・名前色は禁止）。
- 定義ファイル: `src/styles/colors.css`
  - 例: `--color-bg`, `--color-surface`, `--color-white`, `--color-red`, `--color-green`, `--color-gray` など
- フォント系は `src/styles/typography.css` を参照します。

使用例（CSS Modules）

```css
/* src/components/Example/index.module.css */
.root {
  background-color: var(--color-bg);
  color: var(--color-white);
}
```

```tsx
// src/components/Example/index.tsx
import styles from "./index.module.css";

export const Example = () => {
  return <div className={styles.root}>Example</div>;
};
```

新しい色が必要な場合は、`src/styles/colors.css` にトークンを追加し、名称は `--color-*` のケバブケースで統一してください。  
必要な変数は基本的にすでに設定済みです。

推奨事項

- CSS Modules（`*.module.css`）の利用
- クラス名は用途ベースでシンプルに（例: `root`, `title`, `actions`）

## コーディング規約/静的解析

- ESLint/TypeScript による型・品質チェックを適用
- import 並び順や未使用 import は ESLint ルールで検出・修正
- Prettier によるコード整形を適用
- CSS は Stylelint を適用

PR を作成する前に以下の実行を推奨します:

```
npm run eslint && npm run stylelint && npm run format
```

## 備考

- 開発時は `src/App.tsx` と `src/components/**` を中心に編集します。
- モックデータは `public/mock.json` を参照できます。

## API モック

現在、実 API が未完成のため、MSW と mock-socket によるモックを使用しています。

詳細は [API_MOCK.md](./API_MOCK.md) を参照してください。
