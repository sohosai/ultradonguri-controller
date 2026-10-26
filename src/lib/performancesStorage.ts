import type { Performance } from "../types/performances";

const STORAGE_KEY = "performances";
const VERSION_KEY = "performances-version";

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
}

// マスターJSONが変わったときだけ新しい内容を採用し、変更がなければlocalStorageの編集内容を優先する
export async function loadPerformances(): Promise<Performance[]> {
  try {
    const response = await fetch("/performances.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const version = hashString(text);
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);

    if (storedVersion === version && stored) {
      try {
        return JSON.parse(stored) as Performance[];
      } catch (error) {
        console.error("[performancesStorage] localStorage の内容が壊れているためマスターから読み直します:", error);
      }
    }

    const data = JSON.parse(text) as Performance[];
    savePerformances(data);
    localStorage.setItem(VERSION_KEY, version);

    return data;
  } catch (error) {
    console.error("[performancesStorage] performances.json の読み込みに失敗しました:", error);
    throw error;
  }
}

export function savePerformances(performances: Performance[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(performances));
}
