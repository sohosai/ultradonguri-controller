import { streamClient } from "../ws/streamClient";

import { apiFetch } from "./client";

import type { Performance } from "../../types/performances";

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
 * GET /performances
 * 楽曲データの取得のみ従来どおり HTTP（バックエンド / mock）で行う
 */
export async function getPerformances(): Promise<Performance[]> {
  return apiFetch<Performance[]>("/performances");
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

export async function postBurariScene(): Promise<void> {
  await apiFetch<void>("/burari-scene", { method: "POST" });
}

export async function postCmScene(): Promise<void> {
  await apiFetch<void>("/cm-scene", { method: "POST" });
}

export async function postNormalScene(): Promise<void> {
  await apiFetch<void>("/normal-scene", { method: "POST" });
}
