import type { Conversion, Music } from "../types/performances";

import type { Performance } from "../types/performances";

const STORAGE_KEY = "song-timing"

// Dateの部分はStringにするかも？
export type SongTiming = {
    title: string;
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
            performance_title: perf.title != null ? perf.title : "",
            should_be_muted: music.should_be_muted == false ? "配信○" : "配信×",
            starts_at: perf.starts_at,
            timing: new Date()
        };
        const dataToAdd = timingToSave.title + "," + timingToSave.performance_title + "," + timingToSave.should_be_muted + "," + timingToSave.starts_at + "," + timingToSave.timing;

        const oldData = getSongTimings();

        const columnTitle = "楽曲名,団体名,配信可能/不可能,開始予定時刻,開始時刻";

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
            title: conv.title != null ? conv.title : "",
            performance_title: conv.id,
            should_be_muted: "なし",
            starts_at: "なし",
            timing: new Date()
        };
        const dataToAdd = timingToSave.title + "," + timingToSave.performance_title + "," + timingToSave.should_be_muted + "," + timingToSave.starts_at + "," + timingToSave.timing;

        const oldData = getSongTimings();

        const columnTitle = "楽曲名,団体名,配信可能/不可能,開始予定時刻,開始時刻";

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
