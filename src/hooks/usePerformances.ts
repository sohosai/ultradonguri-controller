import { useEffect, useState, useCallback } from "react";

import { loadPerformances, savePerformances } from "../lib/performancesStorage";

import type { Performance } from "../types/performances";

type UsePerformancesResult = {
  performances: Performance[] | null;
  isLoading: boolean;
  error: Error | null;
  updatePerformances: (next: Performance[]) => void;
};

export default function usePerformances(): UsePerformancesResult {
  const [performances, setPerformances] = useState<Performance[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setPerformances(await loadPerformances());
      } catch (e) {
        console.error("[usePerformances] performances の読み込みに失敗しました:", e);
        setError(e instanceof Error ? e : new Error("Failed to load performances"));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const updatePerformances = useCallback((next: Performance[]) => {
    setPerformances(next);
    savePerformances(next);
  }, []);

  return { performances, isLoading, error, updatePerformances };
}
