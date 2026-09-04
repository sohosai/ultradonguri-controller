/**
 * osechiAPI クライアント
 *
 * ミュートはdonguriバックエンドを経由せずに、フロントから直接osechiを叩く
 * 接続先は VITE_OSECHI_BASE_URL で指定する
 */

export interface MuteState {
  is_muted: boolean;
}

const TIMEOUT_MS = 3000;
const MAX_RETRIES = 1;

async function osechiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseURL = import.meta.env.VITE_OSECHI_BASE_URL || "";
  const url = baseURL ? `${baseURL}${path}` : path;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/**
 * POST {OSECHI_BASE}/mute
 */
export async function postMute(body: MuteState): Promise<MuteState> {
  return osechiFetch<MuteState>("/mute", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
