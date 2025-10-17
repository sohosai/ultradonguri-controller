import { useEffect, useState, useCallback } from "react";

import { getPerformances } from "../api/http/endpoints";
import { applyMusicEdits } from "../lib/musicStorage";

import type { Performance } from "../types/performances";

type UsePerformancesResult = {
  performances: Performance[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export default function usePerformances(): UsePerformancesResult {
  const [performances, setPerformances] = useState<Performance[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPerformances();
      // 各パフォーマンスの楽曲リストに差分データを適用
      const dataWithEdits = data.map((performance) => ({
        ...performance,
        musics: applyMusicEdits(performance.musics),
      }));
      setPerformances(dataWithEdits);
    } catch (e) {
      console.error("[usePerformances] Failed to fetch:", e);
      setError(e instanceof Error ? e : new Error("Failed to fetch performances"));
      setPerformances(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { performances, isLoading, error, refresh: load };
}
