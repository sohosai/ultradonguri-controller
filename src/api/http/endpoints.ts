import { streamClient } from "../ws/streamClient";

/**
 * Type definitions for API requests/responses
 */
export interface PerformanceStartRequest {
  title: string;
  performer: string;
}

export interface MusicRequest {
  title: string;
  artist: string;
  should_be_muted: boolean;
}

export interface ConversionStartRequest {
  next_performances: Array<{
    title: string;
    performer: string;
    description: string;
    starts_at: string;
  }>;
}

export interface ConversionCmModeRequest {
  is_cm_mode: boolean;
}

export interface DisplayCopyright {
  is_displayed_copyright: boolean;
}

/**
 * 以下の送出系は Vite サーバー上の WebSocket リレー経由で Viewer に届ける
 */
export async function postPerformanceStart(body: PerformanceStartRequest): Promise<void> {
  streamClient.send("/performance/start", body);
}

export async function postPerformanceMusic(body: MusicRequest): Promise<void> {
  streamClient.send("/performance/music", body);
}

export async function postConversionStart(body: ConversionStartRequest): Promise<void> {
  streamClient.send("/conversion/start", body);
}

export async function postConversionCmMode(body: ConversionCmModeRequest): Promise<void> {
  streamClient.send("/conversion/cm-mode", body);
}

/**
 * POST /display-copyright
 */
export async function postDisplayCopyright(body: DisplayCopyright): Promise<void> {
  streamClient.send("/display-copyright", body);
}
