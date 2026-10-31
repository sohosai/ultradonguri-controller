# OBS によるミュート

controller（ブラウザ）は OBS WebSocket に直接接続し、OBS の音声を持つ入力すべてのミュートを、controller の「ミュート指示」に合わせる。ミュート指示は、配信NG曲（`should_be_muted`）への曲送りと、ミュートのトグルで変わる。

## 1. 前提

### 1.1 構成

```
controller（ブラウザ） ──OBS WebSocket（ws://<OBS の PC>:4455）──> OBS
```

同じ接続で番組シーンも切り替える（docs/obs-scene.md）。

本番では OBS と controller が同じ PC で動き、controller は `http://localhost:5173` で開く。OBS WebSocket の接続先は `ws://localhost:4455` になる。

### 1.2 OBS のバージョン

OBS 30.1 以降（同梱の obs-websocket は 5.4.2 以降）を前提とする。入力の UUID（`inputUuid`）は obs-websocket 5.4 から使え、OBS 30.0 に同梱の 5.3.3 にはない。

### 1.3 ミュートボタンの持ち主

OBS の音声ミキサーのミュートボタンは、controller 専用とする。操作者が音源を消したいときは、フェーダー（音量）を下げるか、OBS の設定で音源を無効にする。ミュートと音量は OBS の中で別の値なので、controller の操作と操作者の操作はぶつからない。

この決まりにより、controller は「どの入力を自分がミュートしたか」を覚えずに済む。解除のときは、音声を持つ入力すべてを解除する。OBS 上でミュートボタンを押しても、controller がミュート指示どおりに戻す。

配信に乗るのは、番組シーンに入っている入力と、設定の「音声」にあるグローバル音声（デスクトップ音声・マイク）だけである。番組シーンに入っていない入力は、ミュートが解除されても配信には乗らない。

## 2. OBS WebSocket の仕様

obs-websocket 5.x（RPC バージョン 1）を、`obs-websocket-js` 5.0.8 から使う。

### 2.1 接続と認証

接続は次の順で進む。`obs-websocket-js` では、`obs.connect(url, password, { rpcVersion: 1, eventSubscriptions })` の1回の呼び出しで行う。

1. クライアントがサブプロトコル `obswebsocket.json` を指定して WebSocket を開くと、OBS が `Hello`（op 0）を送る。パスワードを設定していれば、`authentication.challenge` と `authentication.salt` が入る。
2. クライアントが `Identify`（op 1）を送る。`rpcVersion: 1`、認証文字列、購読するイベントの種類（`eventSubscriptions`）を入れる。認証文字列は `base64(sha256(base64(sha256(password + salt)) + challenge))` である。
3. OBS が `Identified`（op 2）を返したら、リクエストを送れる。

`eventSubscriptions` には `EventSubscription.Inputs`（値 `1 << 3`）だけを指定する。入力の追加・削除とミュート状態の変化は、どれもこの種類に入る。

### 2.2 使うリクエスト

| リクエスト     | 引数                               | 応答                                                       | 用途                                                                                                 |
| -------------- | ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GetInputList` | なし                               | `inputs`（各要素に `inputName`、`inputUuid`、`inputKind`） | OBS の全入力を取得する。どのシーンにも入っていない入力と、デスクトップ音声などのグローバル音声も含む |
| `GetInputMute` | `inputUuid`                        | `inputMuted: boolean`                                      | 入力のミュート状態を読む。音声を持たない入力では 604 のエラーになるので、音声の有無の判定にも使う    |
| `SetInputMute` | `inputUuid`、`inputMuted: boolean` | なし                                                       | 入力をミュート・解除する                                                                             |

複数の入力へのリクエストは、`obs.callBatch` で1回のメッセージ（`RequestBatch`、op 8）にまとめて送る。`haltOnFailure` は `false`（既定値）のままとし、1つが失敗しても残りを実行する。各リクエストの `requestId` に対象の `inputUuid` を入れ、応答の `requestStatus` を入力ごとに判定する。

`GetInputList` の応答で音声の有無を示す `inputKindCaps` は obs-websocket 5.7 系からしかないので、使わない。

### 2.3 使うイベント

| イベント                                   | データ                         | 用途                                                         |
| ------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| `InputCreated`                             | `inputUuid` ほか               | 追加された入力の音声の有無を調べ、ミュート指示に合わせる     |
| `InputRemoved`                             | `inputUuid` ほか               | 削除された入力を管理から外す                                 |
| `InputMuteStateChanged`                    | `inputUuid`、`inputMuted` ほか | 入力のミュート状態を更新する。ミュート指示と違えば、かけ直す |
| `ConnectionClosed`（ライブラリのイベント） | `code`                         | 切断。認証失敗（4009）以外なら再接続を予約する               |

### 2.4 エラー

| 発生源               | 値                                               | 扱い                                   |
| -------------------- | ------------------------------------------------ | -------------------------------------- |
| 切断時の close code  | 4009 認証失敗                                    | 再接続せず、認証エラーを表示する       |
| 切断時の close code  | それ以外（OBS が起動していないときの 1006 など） | 再接続する                             |
| `requestStatus.code` | 604 `InvalidResourceState`（音声を持たない入力） | 対象から外す                           |
| `requestStatus.code` | 600 `ResourceNotFound`（入力が見つからない）     | 直前に削除された入力として対象から外す |
| `requestStatus.code` | それ以外                                         | 失敗として呼び出し元に返す             |

### 2.5 `obs-websocket-js` の挙動

5.0.8 のソースで確かめた挙動のうち、実装に影響するものを挙げる。

| 項目                | 挙動                                                                                          | 実装での扱い                                        |
| ------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| import の解決先     | 既定の入口は、ブラウザ向けビルドでは JSON 版、Node.js の `import` では msgpack 版に解決される | `obs-websocket-js/json` から import する            |
| `connect` の失敗    | Promise を reject すると同時に、`ConnectionClosed` も発行する                                 | 再接続の予約は `ConnectionClosed` の処理だけで行う  |
| `call` の失敗       | `code` に `requestStatus.code` を入れた `OBSWebSocketError` を投げる                          | `error.code` で 2.4 の扱いを分ける                  |
| `callBatch` の失敗  | 個々のリクエストが失敗しても例外を投げず、結果の配列を返す                                    | 結果を1件ずつ判定する                               |
| タイムアウト        | ない。切断すると応答待ちの Promise は解決も reject もされない                                 | すべてのリクエストを 5 の表のタイムアウトで打ち切る |
| `GetInputList` の型 | 応答の `inputs` は `JsonObject[]` 型                                                          | `inputUuid` を文字列として取り出して使う            |

## 3. ミュートの仕様

### 3.1 状態

| 状態           | 内容                                                    | 保存先                         |
| -------------- | ------------------------------------------------------- | ------------------------------ |
| ミュート指示   | controller がミュートを指示しているか（真偽値）         | localStorage                   |
| 音声入力の状態 | 音声を持つ入力ごとのミュート状態（UUID → `inputMuted`） | メモリ（接続のたびに作り直す） |

### 3.2 かけ直し

処理の中心は「指定した音声入力のうち、ミュート状態がミュート指示と違う入力に、`SetInputMute(ミュート指示)` を送る」ことである。何度実行しても結果は同じになる。これを次のきっかけで実行する。

| きっかけ                                                                                    | 対象           |
| ------------------------------------------------------------------------------------------- | -------------- |
| 接続完了（再接続を含む）。`GetInputList` と `GetInputMute` で音声入力の状態を作り直したあと | 音声入力すべて |
| トグル・曲送りでミュート指示が変わったとき                                                  | 音声入力すべて |
| `InputCreated` で音声を持つ入力が追加されたとき                                             | 追加された入力 |
| `InputMuteStateChanged` でミュート指示と違う値になったとき                                  | 変わった入力   |

controller の再読み込み、OBS の再起動、切断のどれのあとも、接続が完了すれば localStorage のミュート指示どおりに戻る。

### 3.3 `isMuted` の定義

controller の `isMuted` は、音声入力が1つ以上あり、そのすべてがミュートされているときだけ `true` とする。未接続のときは `false` とする。

### 3.4 未接続時の扱い

未接続のときにミュート指示の変更を求められたら、待たずにエラーを返す。接続後にまとめて送ると、曲が進んだあとで古いミュート操作が反映されるおそれがあるためである。呼び出し元は、エラーを画面に表示する。

ただし、日付を選んだときに掛ける1曲目のミュート指示は、接続が完了するまで controller が持っておき、接続してから掛ける。ページを開いた直後は、OBS への接続より先にこの指示が出るためである。

## 4. 実装

### 4.1 OBS クライアント（`src/api/obs/obsClient.ts`）

`streamClient` と同じく、モジュールのシングルトンである。

- `start()`: 初回だけ、4.3 のエンドポイントから接続情報を読んで接続を始める。
- `setMuted(isMuted): Promise<void>`: ミュート指示を変えて保存し、3.2 のかけ直しを行う。未接続、タイムアウト、2.4 で失敗とするエラーのときは例外を投げる。
- `subscribe(listener)` と `getSnapshot()`: 接続状態（`connecting` / `connected` / `disconnected` / `authFailed`）と `isMuted` を、React の `useSyncExternalStore` から読める形で渡す。
- 接続ごとに `OBSWebSocket` のインスタンスを作り、現在のインスタンス以外からのイベントは無視する。`ConnectionClosed` を受けたら、5 の表の間隔で再接続する（2.4、2.5）。

### 4.2 フック（`src/hooks/useObsMute.ts`）

`obsClient.start()` を呼び、`{ isMuted, connectionStatus, setMuted }` を返す。`Controller` はこのフックからミュート状態を得る。

### 4.3 接続情報（`server/donguriServerPlugin.ts`）

接続先とパスワードは環境変数で指定する。ビルドし直さずに変えられるよう、ビルド時に埋め込まれる `VITE_*` は使わない。代わりに、controller の Node サーバー（dev / preview）が実行時の環境変数を読み、`GET /obs/config` で `{ url, password, scenes: { normal, cm, burari } }` を返す。

| 環境変数                 | 内容                                    | 未設定のとき          |
| ------------------------ | --------------------------------------- | --------------------- |
| `OBS_WEBSOCKET_URL`      | ブラウザから見た OBS WebSocket の接続先 | `ws://localhost:4455` |
| `OBS_WEBSOCKET_PASSWORD` | OBS WebSocket のパスワード              | 空（認証なし）        |
| `OBS_NORMAL_SCENE_NAME`  | 通常時のシーン名（`scenes.normal`）     | `Normal_Scene`        |
| `OBS_CM_SCENE_NAME`      | CM のシーン名（`scenes.cm`）            | `CM_Scene`            |
| `OBS_BURARI_SCENE_NAME`  | ぶらり旅のシーン名（`scenes.burari`）   | `Burari_Scene`        |

環境変数は Vite の `loadEnv` で読むので、dev では `.env` にも書ける。実行中の環境変数が `.env` より優先される。値を変えたら、controller を再起動してからページを再読み込みする。

`/obs/config` は、controller のポート（5173）に届く人なら誰でもパスワードを読める。OBS WebSocket のポート（4455）も同じ LAN に開いているので、守れる範囲は変わらない。

### 4.4 エラー表示（`src/pages/Controller.tsx`）

OBS に接続できないことは、ほかの操作の失敗と同じエラー表示に出す。

| 接続状態 | 表示                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 未接続   | 「OBS に接続できません」。再接続を繰り返す間は出し直さず、未接続になったときに1回だけ出す |
| 認証失敗 | 「OBS の認証に失敗しました」                                                              |
| 接続完了 | 出ていた上の2つのエラーを消す                                                             |

## 5. 決めた値

| 項目                                     | 値                                    |
| ---------------------------------------- | ------------------------------------- |
| 対応する OBS                             | 30.1 以降（obs-websocket 5.4.2 以降） |
| import 先                                | `obs-websocket-js/json`               |
| RPC バージョン                           | 1                                     |
| 購読するイベント                         | `EventSubscription.Inputs`            |
| 入力の指定                               | `inputUuid`                           |
| `callBatch` の各リクエストの `requestId` | 対象の `inputUuid`                    |
| 接続情報のエンドポイント                 | `GET /obs/config`                     |
| 接続先 URL の初期値                      | `ws://localhost:4455`                 |
| 再接続の間隔                             | 2000 ms（`streamClient` と同じ）      |
| OBS へのリクエストのタイムアウト         | 3000 ms                               |
| localStorage のキー（ミュート指示）      | `obs_muted`                           |

## 6. 動作確認

### 6.1 起動

1. OBS で「ツール → WebSocket サーバー設定」から WebSocket を有効にし、パスワードを設定する。
2. controller の `.env` に次を書き、`npm run dev` で起動する。

   ```env
   OBS_WEBSOCKET_PASSWORD=（OBS で設定したパスワード）
   ```

3. `http://localhost:5173/` を開く。

### 6.2 確認項目

1. 接続でき、「OBS に接続できません」のエラーが出ない。
2. 誤ったパスワードでは再接続を繰り返さず、「OBS の認証に失敗しました」のエラーが出る。
3. トグル・曲送りで、音声を持つ入力すべてのミュートが OBS の音声ミキサーで切り替わる。シーンに入っていない入力とデスクトップ音声も含む。
4. 画像やテキストなど音声のない入力があっても、ミュートの操作がエラーにならない。
5. ミュート中に音声のある入力を追加すると、追加した入力もミュートされる。
6. OBS の音声ミキサーでミュートボタンを押すと、ミュート指示どおりに戻される。
7. 配信NG曲でミュート中に controller を再読み込みしても、ミュートが外れない。
8. OBS を終了して起動し直すと、自動で再接続し、ミュート指示どおりの状態に戻る。
