import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import type { IncomingMessage, ServerResponse } from "node:http";

export const VIDEOS_URL_PREFIX = "/burari/videos";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * パストラバーサル対策。安全な mp4 ファイル名のみ許可する
 */
function sanitizeFilename(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (
    decoded.length === 0 ||
    decoded.includes("/") ||
    decoded.includes("\\") ||
    decoded.includes("..") ||
    decoded.startsWith(".")
  ) {
    return null;
  }
  if (!decoded.toLowerCase().endsWith(".mp4")) {
    return null;
  }

  return decoded;
}

async function handleList(videosDir: string, res: ServerResponse): Promise<void> {
  const entries = await fs.readdir(videosDir, { withFileTypes: true });
  const videos = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".mp4")) continue;
    const stat = await fs.stat(path.join(videosDir, entry.name));
    videos.push({ filename: entry.name, size: stat.size });
  }
  videos.sort((a, b) => a.filename.localeCompare(b.filename, "ja"));
  sendJson(res, 200, videos);
}

async function handleUpload(
  videosDir: string,
  req: IncomingMessage,
  res: ServerResponse,
  filenameParam: string | null
): Promise<void> {
  const filename = filenameParam ? sanitizeFilename(filenameParam) : null;
  if (!filename) {
    sendJson(res, 400, { error: "filename クエリに .mp4 のファイル名を指定してください" });

    return;
  }
  const filePath = path.join(videosDir, filename);
  try {
    await fs.access(filePath);
    sendJson(res, 409, { error: `${filename} は既に存在します` });

    return;
  } catch {
    // 存在しない場合のみ書き込みへ進む
  }

  const tmpPath = `${filePath}.upload`;
  try {
    await new Promise<void>((resolve, reject) => {
      const out = createWriteStream(tmpPath, { flags: "wx" });
      req.pipe(out);
      out.on("finish", resolve);
      out.on("error", reject);
      req.on("error", reject);
    });
    await fs.rename(tmpPath, filePath);
    sendJson(res, 201, { filename });
  } catch (error) {
    await fs.rm(tmpPath, { force: true });
    sendJson(res, 500, { error: String(error) });
  }
}

async function handleServe(
  videosDir: string,
  req: IncomingMessage,
  res: ServerResponse,
  filename: string
): Promise<void> {
  const filePath = path.join(videosDir, filename);
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    sendJson(res, 404, { error: `${filename} は存在しません` });

    return;
  }

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", "video/mp4");

  const range = req.headers.range;
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
  if (match && (match[1] !== "" || match[2] !== "")) {
    const start = match[1] === "" ? Math.max(0, stat.size - Number(match[2])) : Number(match[1]);
    const end = match[1] !== "" && match[2] !== "" ? Number(match[2]) : stat.size - 1;
    if (start >= stat.size || end >= stat.size || start > end) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${stat.size}`);
      res.end();

      return;
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    res.setHeader("Content-Length", end - start + 1);
    createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Length", stat.size);
    createReadStream(filePath).pipe(res);
  }
}

async function handleDelete(videosDir: string, res: ServerResponse, filename: string): Promise<void> {
  const filePath = path.join(videosDir, filename);
  try {
    await fs.access(filePath);
  } catch {
    sendJson(res, 404, { error: `${filename} は存在しません` });

    return;
  }
  await fs.rm(filePath);
  res.statusCode = 204;
  res.end();
}

/**
 * /burari/videos 配下の動画 API（一覧・アップロード・配信・削除）。
 * connect ミドルウェアとして dev / preview サーバーに接続する
 */
export function createVideosMiddleware(videosDir: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void): Promise<void> => {
    const url = new URL(req.url ?? "", "http://localhost");
    if (url.pathname !== VIDEOS_URL_PREFIX && !url.pathname.startsWith(`${VIDEOS_URL_PREFIX}/`)) {
      next();

      return;
    }

    try {
      await fs.mkdir(videosDir, { recursive: true });

      if (url.pathname === VIDEOS_URL_PREFIX) {
        if (req.method === "GET") {
          await handleList(videosDir, res);
        } else if (req.method === "POST") {
          await handleUpload(videosDir, req, res, url.searchParams.get("filename"));
        } else {
          sendJson(res, 405, { error: "Method Not Allowed" });
        }

        return;
      }

      const filename = sanitizeFilename(url.pathname.slice(VIDEOS_URL_PREFIX.length + 1));
      if (!filename) {
        sendJson(res, 400, { error: "不正なファイル名です" });

        return;
      }
      if (req.method === "GET") {
        await handleServe(videosDir, req, res, filename);
      } else if (req.method === "DELETE") {
        await handleDelete(videosDir, res, filename);
      } else {
        sendJson(res, 405, { error: "Method Not Allowed" });
      }
    } catch (error) {
      sendJson(res, 500, { error: String(error) });
    }
  };
}
