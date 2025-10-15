import { apiFetch } from "./client";

import type { Performance } from "../../types/performances";

/**
 * Type definitions for API requests/responses
 */
export interface PerformanceStartRequest {
  performance: {
    title: string;
    performer: string;
  };
}

export interface MusicRequest {
  music: {
    title: string;
    artist: string;
    should_be_muted: boolean;
  };
}

export interface ConversionStartRequest {
  next_performances: Array<{
    title: string;
    performer: string;
    description: string;
    starts_at: string; // timestamp
  }>;
}

export interface ConversionCmModeRequest {
  is_cm_mode: boolean;
}

export interface ForceMuteRequest {
  is_muted: boolean;
}

/**
 * GET /performances
 */
export async function getPerformances(): Promise<Performance[]> {
  return apiFetch<Performance[]>("/performances");
}

/**
 * POST /performance/start
 */
export async function postPerformanceStart(body: PerformanceStartRequest): Promise<void> {
  return apiFetch("/performance/start", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /performance/music
 */
export async function postPerformanceMusic(body: MusicRequest): Promise<void> {
  return apiFetch("/performance/music", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /conversion/start
 */
export async function postConversionStart(body: ConversionStartRequest): Promise<void> {
  return apiFetch("/conversion/start", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /conversion/cm-mode
 */
export async function postConversionCmMode(body: ConversionCmModeRequest): Promise<void> {
  return apiFetch("/conversion/cm-mode", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /force_mute
 */
export async function postForceMute(body: ForceMuteRequest): Promise<void> {
  return apiFetch("/force_mute", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
