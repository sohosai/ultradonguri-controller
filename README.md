# ultradonguri-controller

React + TypeScript + Vite で構築されたコントローラ用フロントエンドです。開発環境の整備手順、コンポーネントの分け方、スタイル（色変数の必須利用）についての指針をまとめます。

## 必要環境

- Node.js
- npm

Node のバージョンは `node -v` で確認し、必要に応じて `nvm` 等で切り替えてください。

## セットアップ

1. リポジトリのクローン
   - `git clone https://github.com/sohosai/ultradonguri-controller.git`
2. 依存関係のインストール
   - `npm install`
3. 開発サーバ起動
   - `npm run dev`
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

---

## API モック（開発用）

現在、実 API が未完成のため、MSW と mock-socket によるモックを使用しています。

### 仕組み

- **HTTP API**: MSW (Mock Service Worker) が fetch リクエストをインターセプトし、モックレスポンスを返します
- **WebSocket**: mock-socket がブラウザ内で WebSocket サーバーを起動し、リアルタイム配信をシミュレートします
- **連携**: POST リクエストを送ると、その内容が即座に WebSocket で全クライアントに配信されます

### モード切替（.env）

開発用モックと実 API を環境変数で切り替えられます。

```env
# モックモード（開発用・デフォルト）
VITE_API_MODE=mock
VITE_WS_URL=ws://local-mock/stream

# 実 API モード（本番用）
VITE_API_MODE=real
VITE_WS_URL=wss://your-api-server.com/stream
```

### API の呼び出し方

#### HTTP リクエスト

```typescript
import {
  getPerformances,
  postPerformanceStart,
  postPerformanceMusic,
  postConversionStart,
  postConversionCmMode,
  postForceMute,
} from "./api/http/endpoints";

// パフォーマンス一覧を取得
const performances = await getPerformances();

// パフォーマンス開始
await postPerformanceStart({
  performance: { title: "曲名", performer: "演者名" },
});

// 楽曲情報を送信
await postPerformanceMusic({
  music: { title: "曲名", artist: "アーティスト", should_be_muted: false },
});

// 転換開始
await postConversionStart({
  next_performances: [
    {
      title: "次の演目",
      performer: "演者",
      description: "説明",
      starts_at: "2025-10-14T12:00:00Z",
    },
  ],
});

// CM モード切替
await postConversionCmMode({ is_cm_mode: true });

// 強制ミュート
await postForceMute({ is_muted: true });
```

#### WebSocket（リアルタイム受信）

```typescript
import { streamClient } from "./api/ws/streamClient";

// 接続開始
streamClient.connect();

// イベントハンドラーを登録
const unsubscribe = streamClient.on("performance", (data) => {
  console.log("パフォーマンス開始:", data);
});

// 必要に応じて購読解除
unsubscribe();

// 接続終了
streamClient.disconnect();
```

受信できるイベントタイプ:

- `performance`: パフォーマンス開始
- `music`: 楽曲情報
- `conversion/start`: 転換開始
- `conversion/cm-mode`: CM モード切替
- `force_mute`: 強制ミュート

### 実 API 完成後の削除手順

実 API サーバーが完成したら、以下の手順でモックを削除してください。

1. **削除するディレクトリ/ファイル**:

   ```
   src/api/mock/          # モック関連のすべてのファイル
   public/mockServiceWorker.js  # MSW の Service Worker
   ```

2. **削除するパッケージ**:

   ```bash
   npm uninstall msw mock-socket
   ```

3. **package.json から削除**:

   ```json
   "msw": {
     "workerDirectory": ["public"]
   }
   ```

4. **src/main.tsx の修正**:
   モック初期化のコードを削除し、元の形に戻します。

   ```typescript
   // 削除: initializeMocks() 関数と呼び出し
   // 元に戻す:
   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <App />
     </StrictMode>,
   );
   ```

5. **.env の更新**:
   実 API の URL を設定します。
   ```env
   VITE_API_MODE=real
   VITE_WS_URL=wss://your-api-server.com/stream
   ```

**残すもの**:

- `src/api/http/` (client.ts, endpoints.ts) - 実 API でも使用
- `src/api/ws/streamClient.ts` - 実 WebSocket でも使用

これらのファイルは実 API でもそのまま使えるように設計されています。
