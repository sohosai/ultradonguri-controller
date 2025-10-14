import { getConversion } from "../data/conversions";

import type { Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

export const flattenTracks = (list: Performance[]): TrackRef[] => {
  const flattened: TrackRef[] = [];
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    for (const m of p.musics) {
      flattened.push({ type: "music", performanceId: p.id, musicId: m.id });
    }
    // 各パフォーマンスの後にconversionを追加
    const conversion = getConversion(i);
    flattened.push({ type: "conversion", conversionId: conversion.id });
  }

  return flattened;
};

export const findNextTrackRef = (list: Performance[], current: TrackRef | null): TrackRef | null => {
  if (!current) return null;
  const flattened = flattenTracks(list);
  const idx = flattened.findIndex((r) => {
    if (r.type === "music" && current.type === "music") {
      return r.performanceId === current.performanceId && r.musicId === current.musicId;
    }
    if (r.type === "conversion" && current.type === "conversion") {
      return r.conversionId === current.conversionId;
    }

    return false;
  });
  if (idx < 0) return null;

  return flattened[idx + 1] ?? null;
};
