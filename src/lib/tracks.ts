import type { Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

export const flattenTracks = (list: Performance[]): TrackRef[] => {
  const flattened: TrackRef[] = [];
  for (const p of list) {
    for (const m of p.musics) {
      flattened.push({ performanceId: p.id, musicId: m.id });
    }
  }
  return flattened;
};

export const findNextTrackRef = (
  list: Performance[],
  current: TrackRef | null
): TrackRef | null => {
  if (!current) return null;
  const flattened = flattenTracks(list);
  const idx = flattened.findIndex(
    (r) => r.performanceId === current.performanceId && r.musicId === current.musicId
  );
  if (idx < 0) return null;
  return flattened[idx + 1] ?? null;
};

