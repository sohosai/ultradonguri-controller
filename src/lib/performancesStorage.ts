import type { Performance } from "../types/performances";

const STORAGE_KEY = "performances";

// localStorage にあればそれを返し、なければマスターJSONをコピーして返す
export async function loadPerformances(): Promise<Performance[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Performance[];
    } catch (error) {
      console.error("[performancesStorage] localStorage の内容が壊れているためマスターから読み直します:", error);
    }
  }

  try {
    const response = await fetch("/performances.json");
    const data = (await response.json()) as Performance[];
    savePerformances(data);

    return data;
  } catch (error) {
    console.error("[performancesStorage] performances.json の読み込みに失敗しました:", error);
    throw error;
  }
}

export function savePerformances(performances: Performance[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(performances));
}
