/**
 * ぶらり旅動画の管理 API クライアント。
 * バックエンドではなく Vite サーバー（server/videosMiddleware.ts）に対して通信するため、
 * VITE_API_BASE_URL は使わず常に同一オリジンへリクエストする
 */

export interface BurariVideo {
  filename: string;
  size: number;
}

const BASE_PATH = "/burari/videos";

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // JSON でないレスポンスは無視してステータスから組み立てる
  }

  return `HTTP ${response.status}: ${response.statusText}`;
}

export async function getBurariVideos(): Promise<BurariVideo[]> {
  const response = await fetch(BASE_PATH);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function uploadBurariVideo(file: File): Promise<void> {
  const response = await fetch(`${BASE_PATH}?filename=${encodeURIComponent(file.name)}`, {
    method: "POST",
    headers: { "Content-Type": "video/mp4" },
    body: file,
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function deleteBurariVideo(filename: string): Promise<void> {
  const response = await fetch(`${BASE_PATH}/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

/**
 * Viewer の <video> にそのまま渡せる動画 URL
 */
export function burariVideoUrl(filename: string): string {
  return `${BASE_PATH}/${encodeURIComponent(filename)}`;
}
