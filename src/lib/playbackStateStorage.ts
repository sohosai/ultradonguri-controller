import type { TrackRef } from "../types/tracks";

const STORAGE_KEY = "playback-state";

// サイトを閉じて開き直したときに続きから再開するための状態
export type PlaybackState = {
  dateKey: string;
  currentTrack: TrackRef | null;
  nextTrack: TrackRef | null;
  isCopyrightVisible: boolean;
  isCmMode: boolean;
};

// 保存がない、または壊れている場合はnull
export function loadPlaybackState(): PlaybackState | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const state = JSON.parse(stored) as PlaybackState;
    if (typeof state.dateKey !== "string") return null;

    return state;
  } catch (error) {
    console.error("[playbackStateStorage] localStorage の内容が壊れているため復元しません:", error);

    return null;
  }
}

export function savePlaybackState(state: PlaybackState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
