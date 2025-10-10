import { useEffect, useState, useCallback } from "react";

import type { Performance } from "../types/performances";

type UsePerformancesResult = {
  performances: Performance[] | null;
  refresh: () => Promise<void>;
};

// ToDo; APIができ次第に置き換え予定

export default function usePerformances(): UsePerformancesResult {
  const [performances, setPerformances] = useState<Performance[] | null>(null);

  const load = useCallback(async () => {
    const url = `${import.meta.env.BASE_URL}mock.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = (await res.json()) as Performance[];
      setPerformances(json);
    } catch (e) {
      console.error(e);
      setPerformances([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { performances, refresh: load };
}
