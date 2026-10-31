import fs from "node:fs/promises";
import path from "node:path";

import { loadEnv } from "vite";
import { WebSocketServer, WebSocket } from "ws";

import { createVideosMiddleware } from "./videosMiddleware";

import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { Plugin } from "vite";

export const RELAY_PATH = "/burari/ws";
export const OBS_CONFIG_PATH = "/obs/config";
const PERFORMANCES_PATH = "/performances.json";
const DEFAULT_OBS_WEBSOCKET_URL = "ws://localhost:4455";
const DEFAULT_SCENE_NAMES = { normal: "Normal_Scene", cm: "CM_Scene", burari: "Burari_Scene" };

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
    // 再送が済んだことを知らせ、クライアントが過去のイベントから状態を作り終えたと判断できるようにする
    ws.send(JSON.stringify({ type: "/relay/synced", data: {}, offset: nextOffset - 1 }));

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
 * リポジトリ直下の performances.json があれば /performances.json として返す。
 * 起動後に差し替えても、ページの再読み込みで反映される。無いときは public/ の performances.json に任せる。
 */
function createPerformancesMiddleware(filePath: string) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    const pathname = new URL(req.url ?? "", "http://localhost").pathname;
    if (req.method !== "GET" || pathname !== PERFORMANCES_PATH) {
      next();

      return;
    }

    fs.readFile(filePath).then(
      (data) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
      },
      () => next()
    );
  };
}

/**
 * OBS WebSocket の接続先・パスワードとシーン名を返す。
 * VITE_* はビルド時に埋め込まれて変えるたびにビルドし直すことになるので、起動時の環境変数から配る。
 */
function createObsConfigMiddleware(env: Record<string, string>) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (req.method !== "GET" || req.url !== OBS_CONFIG_PATH) {
      next();

      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        url: env.OBS_WEBSOCKET_URL || DEFAULT_OBS_WEBSOCKET_URL,
        password: env.OBS_WEBSOCKET_PASSWORD ?? "",
        scenes: {
          normal: env.OBS_NORMAL_SCENE_NAME || DEFAULT_SCENE_NAMES.normal,
          cm: env.OBS_CM_SCENE_NAME || DEFAULT_SCENE_NAMES.cm,
          burari: env.OBS_BURARI_SCENE_NAME || DEFAULT_SCENE_NAMES.burari,
        },
      })
    );
  };
}

/**
 * Controller ↔ Viewer 間の通信を中継する Vite プラグイン。
 * dev / preview の両サーバーに WebSocket リレー（/burari/ws）、OBS の接続情報（/obs/config）、
 * 公演データ（/performances.json）を追加する。
 */
export function donguriServerPlugin(): Plugin {
  let videosDir = path.resolve(process.cwd(), "videos");
  let performancesFile = path.resolve(process.cwd(), "performances.json");
  // .env と process.env の OBS_* を読む（process.env が優先）
  let obsEnv: Record<string, string> = {};

  return {
    name: "donguri-server",
    configResolved(config) {
      videosDir = path.resolve(config.root, "videos");
      performancesFile = path.resolve(config.root, "performances.json");
      obsEnv = loadEnv(config.mode, config.envDir, "OBS_");
    },
    configureServer(server) {
      if (server.httpServer) setupRelay(server.httpServer as Server);
      server.middlewares.use(createVideosMiddleware(videosDir));
      server.middlewares.use(createObsConfigMiddleware(obsEnv));
      server.middlewares.use(createPerformancesMiddleware(performancesFile));
    },
    configurePreviewServer(server) {
      setupRelay(server.httpServer as Server);
      server.middlewares.use(createVideosMiddleware(videosDir));
      server.middlewares.use(createObsConfigMiddleware(obsEnv));
      server.middlewares.use(createPerformancesMiddleware(performancesFile));
    },
  };
}
