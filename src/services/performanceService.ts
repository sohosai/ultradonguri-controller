import {
  postConversionCmMode,
  postConversionStart,
  postPerformanceMusic,
  postPerformanceStart,
} from "../api/http/endpoints";

import type { Music, Performance } from "../types/performances";

/**
 * パフォーマンス開始をPOST
 */
export async function sendPerformanceStart(performance: Performance): Promise<void> {
  try {
    await postPerformanceStart({
      title: performance.title,
      performer: performance.performer,
    });
  } catch (error) {
    console.error("[PerformanceService] Failed to post performance/start:", error);
    throw error;
  }
}

/**
 * 楽曲情報をPOST
 */
export async function sendMusic(music: Music): Promise<void> {
  try {
    await postPerformanceMusic({
      title: music.title,
      artist: music.artist,
      should_be_muted: music.should_be_muted,
    });
  } catch (error) {
    console.error("[PerformanceService] Failed to post performance/music:", error);
    throw error;
  }
}

/**
 * 転換開始をPOST
 */
export async function sendConversionStart(nextPerformances: Performance[]): Promise<void> {
  try {
    await postConversionStart({
      next_performances: nextPerformances.map((perf) => ({
        title: perf.title,
        performer: perf.performer,
        description: perf.description,
        starts_at: perf.starts_at,
      })),
    });
  } catch (error) {
    console.error("[PerformanceService] Failed to post conversion/start:", error);
    throw error;
  }
}

/**
 * 転換CMモードをPOST
 */
export async function sendConversionCmMode(isCmMode: boolean): Promise<void> {
  try {
    await postConversionCmMode({
      is_cm_mode: isCmMode,
    });
  } catch (error) {
    console.error("[PerformanceService] Failed to post conversion/cm-mode:", error);
    throw error;
  }
}
