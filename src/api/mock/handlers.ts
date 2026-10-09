import { http, HttpResponse } from "msw";

/**
 * MSW HTTP request handlers
 * 送出系の通信は WebSocket リレー（server/donguriServerPlugin.ts）に移行したため、
 * ここでは楽曲データの取得のみモックする
 */
export const handlers = [
  http.get("/performances", async () => {
    try {
      const response = await fetch("/performances.json");
      const data = await response.json();

      return HttpResponse.json(data);
    } catch (error) {
      console.error("[MSW] performances.json の読み込みに失敗しました:", error);

      return HttpResponse.json({ error: "Failed to load mock data" }, { status: 500 });
    }
  }),

  // POST /mute - おせちAPIのモック（フロントから直接おせちを叩く想定。どんぐりバックエンドは経由しない）
  http.post("/mute", async ({ request }) => {
    const body = (await request.json()) as { is_muted: boolean };

    // 更新後のミュート状態を返す
    return HttpResponse.json({ is_muted: body.is_muted });
  }),
];
