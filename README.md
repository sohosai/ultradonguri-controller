# ultradonguri-controller

React + TypeScript + Vite で構築されたコントローラ用フロントエンドです。開発環境の整備手順、コンポーネントの分け方、スタイル（色変数の必須利用）についての指針をまとめます。

## 必要環境

- Node.js 22 以降
- npm

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

### 環境変数

`.env.example` を `.env` にコピーして使います。

| 環境変数                 | 内容                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_MODE`          | `mock`（既定）は OBS に接続せず、シーンを切り替えない。ミュートは画面の表示だけが切り替わる。`real` は OBS に接続する |
| `OBS_WEBSOCKET_URL`      | ブラウザから見た OBS WebSocket の接続先（既定は `ws://localhost:4455`）                                               |
| `OBS_WEBSOCKET_PASSWORD` | OBS WebSocket のパスワード                                                                                            |
| `OBS_NORMAL_SCENE_NAME`  | 通常時のシーン名（既定は `Normal_Scene`）                                                                             |
| `OBS_CM_SCENE_NAME`      | CM のシーン名（既定は `CM_Scene`）                                                                                    |
| `OBS_BURARI_SCENE_NAME`  | ぶらり旅のシーン名（既定は `Burari_Scene`）                                                                           |

`VITE_*` はビルド時に埋め込まれるので、変えたら `npm run build` からやり直します。`OBS_*` は controller の起動時に読みます。

### 本番での起動

OBS と同じ PC で controller を動かします。

1. OBS の「ツール → WebSocket サーバー設定」で WebSocket サーバーを有効にし、パスワードを設定する（OBS 30.1 以降）。
2. OBS に通常時・CM・ぶらり旅のシーンを作る。
3. リポジトリをクローンし、`npm ci` を実行する。
4. `.env.example` を `.env` にコピーし、`VITE_API_MODE=real` と `OBS_WEBSOCKET_PASSWORD` を書く。シーン名が既定と違えば `OBS_*_SCENE_NAME` も書く。
5. 公演データを、リポジトリ直下に `performances.json` として置く。
6. `npm run build` でビルドし、`npm run preview` で起動する。
7. controller を `http://localhost:5173/` で開く。
8. OBS のブラウザソースで `http://localhost:5173/viewer` を開く。プロパティで「OBS経由で音声を制御」を有効にする。

`performances.json` は起動したまま差し替えられ、controller を再読み込みすると読み直します。ぶらり旅の動画は、controller から上げるとリポジトリ直下の `videos/` に保存されます。

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
- 団体・楽曲のマスターデータは、リポジトリ直下に `performances.json` があればそれを、なければ `public/performances.json` を使います。直下のファイルは起動したまま差し替えられ、ページを再読み込みすると読み直します。マスターの内容が変わると自動的に新しいデータが採用され、変更がない場合は localStorage（キー `performances` / `performances-version`）の編集内容が維持されます。

## ミュート

配信NG曲のミュートは、controller が OBS WebSocket に直接接続し、OBS の音声を持つ入力すべてに掛けます。OBS 30.1 以降が必要です。OBS の音声ミキサーのミュートボタンは controller が操作するので、手で使わないでください。

仕様と動作確認の手順は [docs/obs-mute.md](./docs/obs-mute.md) を参照してください。

## シーン切替

番組シーンも controller が OBS WebSocket で切り替えます。ぶらり旅の再生中はぶらり旅のシーン、CM モードのときは CM のシーン、それ以外は通常時のシーンにします。OBS に接続し直したときも、そのときの状態のシーンに戻します。

仕様と動作確認の手順は [docs/obs-scene.md](./docs/obs-scene.md) を参照してください。
