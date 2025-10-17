import { useCallback, useState } from "react";

import { findNextTrackRef } from "../lib/tracks";

import type { Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

type UsePlaybackResult = {
  currentTrack: TrackRef | null;
  nextTrack: TrackRef | null;
  selectNextTrack: (ref: TrackRef) => void;
  skipToNext: (performances: Performance[] | null) => void;
  reset: () => void;
  initializeFromFirst: (performances: Performance[] | null) => void;
};

export default function usePlayback(): UsePlaybackResult {
  const [currentTrack, setCurrentTrack] = useState<TrackRef | null>(null);
  const [nextTrack, setNextTrack] = useState<TrackRef | null>(null);

  const selectNextTrack = useCallback((ref: TrackRef) => {
    setNextTrack(ref);
  }, []);

  const skipToNext = useCallback(
    (performances: Performance[] | null) => {
      if (!performances) return;
      if (!nextTrack) return;
      setCurrentTrack(nextTrack);
      const next = findNextTrackRef(performances, nextTrack);
      setNextTrack(next);
    },
    [nextTrack]
  );

  const reset = useCallback(() => {
    setCurrentTrack(null);
    setNextTrack(null);
  }, []);

  const initializeFromFirst = useCallback(
    (performances: Performance[] | null) => {
      if (!performances || performances.length === 0) {
        reset();

        return;
      }
      const firstPerf = performances[0];
      const firstMusic = firstPerf.musics[0];
      if (firstMusic) {
        const firstRef: TrackRef = { type: "music", performanceId: firstPerf.id, musicId: firstMusic.id };
        setCurrentTrack(firstRef);
        const nextRef = findNextTrackRef(performances, firstRef);
        setNextTrack(nextRef);
      } else {
        reset();
      }
    },
    [reset]
  );

  return { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst };
}
