import type { Conversion, Music } from "../types/performances";
import type { Performance } from "../types/performances";

const STORAGE_KEY = "song-timing";

// Dateの部分はStringにするかも？
export type SongTiming = {
  title: string;
  id: string;
  performance_title: string;
  should_be_muted: string;
  starts_at: string;
  timing: Date;
};

// データを読み込む関数
function getSongTimings(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    return stored;
  } catch (error) {
    console.error("[songTimingStorage] Failed to parse song Timing:", error);

    return null;
  }
}

// データを受け取って保存する関数
// 楽曲の場合
export function SaveSongTimings(music: Music, perf: Performance): void {
  try {
    const timingToSave: SongTiming = {
      title: music.title != null ? music.title : "",
      id: music.id != null ? music.id : "",
      performance_title: perf.title != null ? perf.title : "",
      should_be_muted: music.should_be_muted == false ? "○" : "×",
      starts_at: perf.starts_at,
      timing: new Date(),
    };
    const dataToAdd = [
      timingToSave.title,
      timingToSave.id,
      timingToSave.performance_title,
      timingToSave.should_be_muted,
      timingToSave.starts_at,
      timingToSave.timing,
    ].map(value => `"${String(value ?? "").replace(/"/g,'""')}"`).join(",");
      
    const oldData = getSongTimings();

    const columnTitle = "楽曲名,ID,団体名,配信可能/不可能,開始予定時刻,開始時刻";

    if (!oldData) {
      const newData = columnTitle + "\n" + dataToAdd;

      localStorage.setItem(STORAGE_KEY, newData);
    } else {
      const newData = oldData + "\n" + dataToAdd;

      localStorage.setItem(STORAGE_KEY, newData);
    }
  } catch (error) {
    console.error("[songTimingStorage] Failed to parse song Timing:", error);
    throw error;
  }
}

//転換パートの場合
export function SaveConvTimings(conv: Conversion): void {
  try {
    const timingToSave: SongTiming = {
      title: "（転換パート）",
      id: conv.id != null ? conv.id : "",
      performance_title: "",
      should_be_muted: "",
      starts_at: "",
      timing: new Date(),
    };
    const dataToAdd = [
      timingToSave.title,
      timingToSave.id,
      timingToSave.performance_title,
      timingToSave.should_be_muted,
      timingToSave.starts_at,
      timingToSave.timing,
    ].map(value => `"${String(value ?? "").replace(/"/g,'""')}"`).join(",");

    const oldData = getSongTimings();

    const columnTitle = "楽曲名,ID,団体名,配信可能/不可能,楽曲開始予定時刻,開始時刻";

    if (!oldData) {
      const newData = columnTitle + "\n" + dataToAdd;

      localStorage.setItem(STORAGE_KEY, newData);
    } else {
      const newData = oldData + "\n" + dataToAdd;

      localStorage.setItem(STORAGE_KEY, newData);
    }
  } catch (error) {
    console.error("[songTimingStorage] Failed to parse song Timing:", error);
    throw error;
  }
}

// CSVをダウンロードする関数
export function downloadCsv() {
  const csvData = localStorage.getItem(STORAGE_KEY);

  if (!csvData) {
    return "CSVデータがありません。";
  } else {
    const blob = new Blob([csvData], { type: "text/csv;charest=utf-8;" });

    const downloadUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "Csv.tsx";

    downloadLink.click();

    URL.revokeObjectURL(downloadUrl);
  }
}
