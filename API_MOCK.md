# API モック（開発用）

現在、実 API が未完成のため、MSW と mock-socket によるモックを使用しています。

## 仕組み

- **HTTP API**: MSW (Mock Service Worker) が fetch リクエストをインターセプトし、モックレスポンスを返します
- **WebSocket**: mock-socket がブラウザ内で WebSocket サーバーを起動し、リアルタイム配信をシミュレートします
- **連携**: POST リクエストを送ると、その内容が即座に WebSocket で全クライアントに配信されます

## モード切替（.env）

開発用モックと実 API を環境変数で切り替えられます。

```env
# モックモード（開発用・デフォルト）
VITE_API_MODE=mock
VITE_WS_URL=ws://local-mock/stream

# 実 API モード（本番用）
VITE_API_MODE=real
VITE_WS_URL=wss://your-api-server.com/stream
```

## API の呼び出し方

### HTTP リクエスト

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

### WebSocket（リアルタイム受信）

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

## 実 API 完成後の削除手順

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
