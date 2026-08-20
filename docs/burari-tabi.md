# ぶらり旅機能 仕様書・実装計画

前半が仕様書、後半がフェーズ別の実装計画（チェックリスト形式）。

---

# 第1部 仕様書

## 1. 背景と概要

donguri は学園祭の生配信で使うテロッパーおよび関連機能である。現在はパフォーマンスシーン（パフォーマンス名・楽曲名の表示）と転換シーン（CM の有無を含む）があり、強制ミュートや著作権表示の切替、送出による次の楽曲 / 転換への移動、楽曲の編集ができる。

ぶらり旅とは、通常配信とは別に事前編集された動画を再生する企画である。
転換シーン中に、通常転換 / CM に加えて、事前に用意された動画（複数）から 1 本を選んで再生できるようにする。
本機能拡張では、その動画の管理（アップロード・削除）と再生操作を donguri（Controller）から行えるようにし、Viewer（OBS ブラウザソース）側で全画面再生する。

## 2. 前提・運用形態

| 項目             | 内容                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controller       | 通常のブラウザ（Chrome 等）で `http://<host>:5173/` を開く                                                                                         |
| Viewer           | **OBS のブラウザソース**で `http://<host>:5173/viewer` を開く                                                                                      |
| 起動方法         | `npm run dev`（開発）/ `npm run build` → `npm run preview`（本番運用）                                                                             |
| 楽曲データ       | 従来どおりバックエンド（mock モードでは MSW（Mock Service Worker ライブラリ）+ `public/mock.json`）から `GET /performances` で取得。**変更しない** |
| 動画フォーマット | **mp4 のみ**対応                                                                                                                                   |

### 2.1 通信アーキテクチャ（重要な設計判断）

Viewer は OBS ブラウザソース（OBS に内蔵された独立のブラウザ。Controller を開くブラウザとは別プロセス）で動くため、Controller のブラウザとは
**BroadcastChannel / IndexedDB / localStorage を一切共有できない**。
そのため「純粋にフロントエンドだけで通信する」ことは不可能であり、代わりに
**Vite の開発サーバー自体を中継役（リレー）にする**。

- 本リポジトリ内の Vite プラグインとしてサーバーミドルウェアを実装する。別プロセス・別リポジトリのバックエンドは立てない
- `configureServer`（dev）と `configurePreviewServer`（preview）の両方に同じミドルウェアを組み込み、`npm run dev` でも `npm run build` → `npm run preview` でも動作させる
- Controller ↔ Viewer のリアルタイム通信は、この Vite サーバー上の **WebSocket リレー**（全接続クライアントへブロードキャスト）で行う。**双方向**（Viewer → Controller の再生終了通知に必要）
- 既存の送出系イベント（`/performance/start`、`/performance/music`、`/conversion/start`、`/conversion/cm-mode`、`/display-copyright`）も、この機会に **BroadcastChannel（mock）/ バックエンド WebSocket（real）から Vite サーバーの WebSocket リレーへ移行**する
- OBS が Vite サーバーへ HTTP で到達できれば、同一マシンでも別マシンでも動作する

### 2.2 動画の保存方式

- Controller 上の**アップロードボタン**から Vite サーバーのアップロードエンドポイントへ送信し、サーバーがディスク上の専用フォルダ **`videos/`（リポジトリ直下、`public/` の外）** に保存する
- `public/` 配下に置かないため、hot reload によって配信状態が崩れる問題を回避できる
- ファイルはディスク上にあるため、ブラウザをリロードしても消えない
- エクスプローラーで `videos/` に直接 mp4 を置いても認識される（一覧はサーバーがフォルダを読むため）
- `videos/` は `.gitignore` に追加し、コミット対象外とする

## 3. 機能仕様

### 3.1 Controller 側 UI

配置場所: 転換操作エリア（`ConversionMenu`、CM ON/OFF トグル）の下部にぶらり旅セクションを追加する。
デザインは既存コンポーネント（`Toggle`、`react-modal` を使った既存モーダル等）と既存のスタイル（CSS Modules + `colors.css` の変数）にできるだけ合わせる。

**ぶらり旅セクション**

1. アップロード済み動画のファイル名一覧を表示し、その中から **1 つを選択**できる
2. **アップロードボタン**: mp4 ファイルを選択してアップロードする（`accept="video/mp4"`）
3. 各動画に**削除ボタン**を付ける（溜まり続けるのを防ぐため）
4. **再生ボタン**: 選択中の動画の再生を開始する
5. **CM 再生中（CM トグル ON）はぶらり旅関連の操作をすべて disabled にする**（CM が OFF のときのみ再生できる）
6. 転換シーン以外（パフォーマンス中）でも再生操作は不可とする
7. **ミュート ON のとき**は、セクション下部に赤文字で
   「ミュートONなので、ぶらり旅の音声は再生されません」と表示する（操作自体は可能）

**再生中モーダル**

1. 再生ボタン押下後、Controller は**モーダル + 背景オーバーレイで画面全体を覆い**、他の操作を一切できなくする
2. モーダル上には再生中の動画ファイル名（情報）と「**再生停止**」ボタンを配置する
3. 「再生停止」押下で Viewer に停止を指示し、モーダルを閉じて通常の転換に戻る
4. Viewer から**再生終了イベント**を受信したら、自動でモーダルを閉じて通常の転換に戻る
5. **保険**: Controller 側でも動画のメタデータから duration を取得し、`duration + マージン（数秒）` のタイマーを持つ。終了イベントが届かなくてもタイマー満了でモーダルを閉じ、操作不能に陥らないようにする

### 3.2 Viewer 側

1. 再生イベントを受信したら、選択された動画を**画面全体を覆う `<video>` オーバーレイ**で再生する（自動再生・音声あり）
2. 停止イベント受信、または動画の `ended` で、オーバーレイを外して**元の転換シーンに戻す**（受信済みの転換シーン state はそのまま保持されているので、オーバーレイの表示/非表示だけで復帰できる）
3. 動画の `ended` 時は、WebSocket リレー経由で Controller に**再生終了イベントを送信**する
4. ぶらり旅再生中に他のイベント（送出、CM 切替等）が届いた場合は無視してよい（Controller がモーダルで塞ぐため実運用では発生しない想定。state 更新自体は行われてもよいが、動画の再生を中断しないこと）
5. ミュートはぶらり旅と**同期しない**。Viewer は音声を常に出力し、実際のミュートは下流（ミキサー / OBS）で掛かる前提。Viewer 側の対応は不要

### 3.3 サーバー（Vite プラグイン）API

| メソッド / パス                   | 内容                                                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /burari/videos`              | `videos/` フォルダ内の mp4 一覧を返す（`[{ filename, size }]`）                                                                                 |
| `POST /burari/videos`             | mp4 をアップロードして `videos/` に保存。拡張子 `.mp4` 以外は 400。**同名ファイルが存在する場合は 409 で拒否**し、Controller はエラーを表示する |
| `DELETE /burari/videos/:filename` | 該当ファイルを削除                                                                                                                              |
| `GET /burari/videos/:filename`    | 動画本体を配信。**Range リクエスト対応必須**（`<video>` のシーク・OBS での再生に必要）                                                          |
| `WebSocket /burari/ws`            | イベントリレー。受信した JSON イベントを送信元以外を含む全接続クライアントへブロードキャスト                                                    |

- ファイル名はパストラバーサル対策としてサニタイズする（`..`、`/` 等を拒否）
- WebSocket のパスは Vite 自身のホットリロード用 WebSocket と衝突しないよう専用パスとし、`httpServer` の `upgrade` イベントでパスを見て振り分ける

### 3.4 WebSocket リレーのイベント仕様

既存イベント（型は現行 `WSEvent` を踏襲、`offset` 付き）:

- `/performance/start`、`/performance/music`、`/conversion/start`、`/conversion/cm-mode`、`/display-copyright`、`/force_mute`

新規イベント:

| type            | 方向                | data                   |
| --------------- | ------------------- | ---------------------- |
| `/burari/play`  | Controller → Viewer | `{ filename: string }` |
| `/burari/stop`  | Controller → Viewer | `{}`                   |
| `/burari/ended` | Viewer → Controller | `{ filename: string }` |

- リレーサーバーはイベントに `offset` を採番し、**メモリ上に直近のイベントログを保持**する。クライアントは接続時に `lastOffset` を渡し、未受信分の再送を受ける（Viewer の OBS 内リロード・再接続時に転換シーン状態を復元するため）。サーバー再起動でログが消えるのは許容する

## 4. スコープ外・非対応

- real モード（外部バックエンドの WebSocket）での送出通信 — 本変更で WebSocket リレーに一本化する。`GET /performances` の HTTP 取得（real / mock 両対応）のみ残す
- mp4 以外のフォーマット対応
- 動画のリネーム・差し替え・プレビュー再生
- Viewer 側のミュート反映
- アップロード容量制限の厳密な管理（ディスク容量に依存。必要なら将来対応）

---

# 第2部 実装計画

各フェーズは独立して動作確認可能な単位で区切る。完了したらチェックを入れること。

## Phase 1: WebSocket リレー基盤（Vite プラグイン）と通信の移行

**ゴール**: Controller ↔ Viewer の既存イベントが、OBS ブラウザソースを含む別プロセス間で Vite サーバー経由で流れる。

- [x] `ws` パッケージを devDependencies に追加する（未使用の mock-socket は削除）
- [x] `server/` に Vite プラグイン `donguriServerPlugin` を新規作成する
  - [x] `configureServer` / `configurePreviewServer` 両対応
  - [x] `httpServer` の `upgrade` を `/burari/ws` パスでフックし、WebSocket リレーを実装（全クライアントへブロードキャスト）
  - [x] offset 採番 + メモリ上イベントログ + 接続時 `lastOffset` からの再送（サーバー再起動検知用の epoch 照合付き）
- [x] `vite.config.ts` にプラグインを追加する
- [x] `src/api/ws/streamClient.ts` を改修する
  - [x] 接続先を Vite サーバーの `/burari/ws`（同一オリジン、`ws(s)://location.host`）に変更
  - [x] イベント**送信**メソッド `send(type, data)` を追加（双方向化、接続前はキューイング、切断時は自動再接続）
  - [x] BroadcastChannel 分岐（mock モード）を撤去
- [x] 送出系を WebSocket リレー送信に切り替える（呼び出し元の変更を避けるため `src/api/http/endpoints.ts` の POST 関数の中身を差し替えた。`performanceService` はそのまま経由）
- [x] MSW モックの整理: `GET /performances` のハンドラのみ残し、送出系 POST ハンドラ・`wsServer.ts`・`outbox.ts` を削除
- [x] 動作確認: Node クライアント 2 つを別プロセスから接続する自動テストで、双方向ブロードキャスト・lastOffset 再送・epoch 不一致時の全再送を dev / preview 両サーバーで確認（OBS 実機での確認は Phase 5 で実施）

## Phase 2: 動画ファイル API（アップロード・一覧・削除・配信）

**ゴール**: `videos/` フォルダを介した動画のアップロード・一覧・削除と、Range リクエスト対応の配信が curl で確認できる。

- [ ] `videos/` ディレクトリの自動作成（サーバー起動時）と `.gitignore` への追加
- [ ] `GET /burari/videos` — 一覧（filename, size）
- [ ] `POST /burari/videos` — multipart 受信、`.mp4` 検証、同名 409、ファイル名サニタイズ
- [ ] `DELETE /burari/videos/:filename`
- [ ] `GET /burari/videos/:filename` — **Range リクエスト対応**の動画配信
- [ ] `src/api/http/` に上記を叩くクライアント関数を追加する（`getBurariVideos` / `uploadBurariVideo` / `deleteBurariVideo`）
- [ ] 動作確認: curl でアップロード → 一覧 → Range 付き GET（206 が返る）→ 削除。エクスプローラーで直接置いたファイルも一覧に出る

## Phase 3: Controller UI（ぶらり旅セクション + 再生中モーダル）

**ゴール**: Controller 上で動画の管理と再生操作が完結する（Viewer 側は未実装でもモーダル開閉まで動く）。

- [ ] `src/components/BurariMenu/`（仮称）を新規作成し、`ConversionMenu` の下部に配置する
  - [ ] 動画一覧の表示と単一選択 UI
  - [ ] アップロードボタン（`accept="video/mp4"`、完了後に一覧を更新、409 等のエラー表示）
  - [ ] 各動画の削除ボタン
  - [ ] 再生ボタン（`/burari/play` を送信）
  - [ ] CM ON 時は全操作を disabled にする
  - [ ] パフォーマンスシーン中は再生ボタンを disabled にする
  - [ ] ミュート ON 時の赤文字警告「ミュートONなので、ぶらり旅の音声は再生されません」
- [ ] 再生中モーダル `src/components/BurariPlayingModal/`（仮称）
  - [ ] react-modal を使い、既存モーダル（ForceMute の確認モーダル等）とスタイルを揃える。オーバーレイで全画面を覆い他操作を不可にする
  - [ ] 再生中ファイル名の表示 + 「再生停止」ボタン（`/burari/stop` を送信して閉じる）
  - [ ] `/burari/ended` 受信で自動クローズ
  - [ ] duration + マージンのフォールバックタイマー（動画 URL からメタデータを読んで duration を取得）
- [ ] デザイン調整: 既存の配色変数・CSS Modules 規約に合わせる
- [ ] 動作確認: アップロード → 一覧選択 → 再生でモーダルが開き、停止/タイマーで閉じる。CM ON・ミュート ON の各状態で表示が仕様どおり

## Phase 4: Viewer 側の動画再生

**ゴール**: OBS ブラウザソース上の Viewer で動画が全画面再生され、終了・停止で転換シーンに復帰する。

- [ ] `src/components/BurariPlayer/`（仮称）: 画面全体を覆う `<video>` オーバーレイ（autoplay、音声あり、`object-fit` で全画面）
- [ ] `src/pages/Viewer.tsx` にぶらり旅 state とイベント購読を追加する
  - [ ] `/burari/play` 受信 → `GET /burari/videos/:filename` を src にして再生開始
  - [ ] `/burari/stop` 受信 → オーバーレイを外して転換シーンへ復帰
  - [ ] `ended` → `/burari/ended` を送信し、オーバーレイを外して転換シーンへ復帰
  - [ ] 再生中に他イベントが届いても動画再生を中断しない
- [ ] 動作確認: OBS ブラウザソースの Viewer で、再生 → 全画面再生（音声あり）→ 終了で転換シーンに自動復帰し、Controller のモーダルも自動で閉じる。停止ボタンでも同様

## Phase 5: 仕上げ・総合確認

- [ ] `npm run build` → `npm run preview` で全機能（リレー・アップロード・再生）が動作する
- [ ] エッジケース確認
  - [ ] Viewer 未接続で再生ボタンを押した場合（タイマーで復帰できる）
  - [ ] ぶらり旅再生中に Controller をリロードした場合の挙動を確認し、必要なら停止送信等でリカバリできること
  - [ ] 存在しないファイル名での再生指示（Viewer 側でエラーにならない）
- [ ] `npm run lint` / `npm run format:check` / `tsc -b`（build 内）が通る
- [ ] `API_MOCK.md` 等、既存ドキュメントの記述と実装の乖離があれば更新する
