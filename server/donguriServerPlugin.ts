import { WebSocketServer, WebSocket } from "ws";

import type { Server } from "node:http";
import type { Plugin } from "vite";

export const RELAY_PATH = "/burari/ws";

// サーバー再起動をまたいだ古い lastOffset での誤った差分受信を防ぐため、
// 起動ごとに epoch を発行してクライアントと照合する
const MAX_LOG_SIZE = 500;

interface RelayEvent {
  type: string;
  data: unknown;
  offset: number;
}

function setupRelay(httpServer: Server): void {
  const wss = new WebSocketServer({ noServer: true });
  const epoch = Date.now().toString(36);
  const log: RelayEvent[] = [];
  let nextOffset = 1;

  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (url.pathname !== RELAY_PATH) {
      // Vite 自身のホットリロード用 WebSocket などはここでは扱わない
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, request) => {
    const url = new URL(request.url ?? "", "http://localhost");
    const clientEpoch = url.searchParams.get("epoch");
    const requestedOffset = Number(url.searchParams.get("lastOffset") ?? "0");
    const lastOffset = clientEpoch === epoch && Number.isFinite(requestedOffset) ? requestedOffset : 0;

    ws.send(JSON.stringify({ type: "/relay/hello", data: { epoch }, offset: lastOffset }));
    for (const event of log) {
      if (event.offset > lastOffset) {
        ws.send(JSON.stringify(event));
      }
    }

    ws.on("message", (raw) => {
      let message: unknown;
      try {
        message = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (typeof message !== "object" || message === null) return;
      const { type, data } = message as { type?: unknown; data?: unknown };
      if (typeof type !== "string") return;

      const event: RelayEvent = { type, data, offset: nextOffset++ };
      log.push(event);
      if (log.length > MAX_LOG_SIZE) {
        log.shift();
      }

      const payload = JSON.stringify(event);
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    });
  });
}

/**
 * Controller ↔ Viewer 間の通信を中継する Vite プラグイン。
 * dev / preview の両サーバーに WebSocket リレー（/burari/ws）を追加する。
 */
export function donguriServerPlugin(): Plugin {
  return {
    name: "donguri-server",
    configureServer(server) {
      if (server.httpServer) setupRelay(server.httpServer as Server);
    },
    configurePreviewServer(server) {
      setupRelay(server.httpServer as Server);
    },
  };
}
