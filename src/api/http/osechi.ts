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

/**
 * 接続先のベースURLを解決する
 * mockモードでは相対パス（MSWが処理）、それ以外では VITE_OSECHI_BASE_URL が必須
 * 本番で相対パスにフォールバックしても意味がないため、未設定なら起動時にエラーにする
 */
function resolveBaseURL(): string {
  const apiMode = import.meta.env.VITE_API_MODE || "mock";
  const baseURL = import.meta.env.VITE_OSECHI_BASE_URL || "";

  if (apiMode !== "mock" && !baseURL) {
    throw new Error('VITE_OSECHI_BASE_URL is required when VITE_API_MODE is not "mock"');
  }

  return baseURL;
}

const BASE_URL = resolveBaseURL();

async function osechiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

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
