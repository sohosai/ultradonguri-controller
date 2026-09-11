import { http, HttpResponse } from "msw";

/**
 * MSW HTTP request handlers
 * 送出系の通信は WebSocket リレー（server/donguriServerPlugin.ts）に移行したため、
 * ここでは楽曲データの取得のみモックする
 */
export const handlers = [
  // GET /performances - Return public/mock.json
  http.get("/performances", async () => {
    try {
      const response = await fetch("/mock.json");
      const data = await response.json();

      return HttpResponse.json(data);
    } catch (error) {
      console.error("[MSW] Failed to load mock.json:", error);

      return HttpResponse.json({ error: "Failed to load mock data" }, { status: 500 });
    }
  }),
];
