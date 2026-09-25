import type { Performance } from "../types/performances";

const STORAGE_KEY = "performances";

// localStorage にあればそれを返し、なければマスターJSONをコピーして返す
export async function loadPerformances(): Promise<Performance[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as Performance[];

  const response = await fetch("/performances.json");
  const data = (await response.json()) as Performance[];
  savePerformances(data);

  return data;
}

export function savePerformances(performances: Performance[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(performances));
}
