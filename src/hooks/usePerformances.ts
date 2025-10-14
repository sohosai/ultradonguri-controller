import { useEffect, useState, useCallback } from "react";

import { getPerformances } from "../api/http/endpoints";

import type { Performance } from "../types/performances";

type UsePerformancesResult = {
  performances: Performance[] | null;
  refresh: () => Promise<void>;
};

export default function usePerformances(): UsePerformancesResult {
  const [performances, setPerformances] = useState<Performance[] | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getPerformances();
      setPerformances(data as Performance[]);
    } catch (e) {
      console.error('[usePerformances] Failed to fetch:', e);
      setPerformances([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { performances, refresh: load };
}
