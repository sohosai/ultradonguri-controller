import type { Music } from "../types/performances";

const STORAGE_KEY = "music-edits";

/**
 * 楽曲の編集差分データ
 */
export type MusicEdit = {
  id: string;
  title?: string;
  artist?: string;
  should_be_muted?: boolean;
};

/**
 * localStorage に保存される全体の差分データ
 */
type MusicEditsStorage = {
  [musicId: string]: MusicEdit;
};

function getMusicEdits(): MusicEditsStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as MusicEditsStorage;
  } catch (error) {
    console.error("[musicStorage] Failed to parse music edits:", error);
    return {};
  }
}

function getMusicEdit(musicId: string): MusicEdit | null {
  const edits = getMusicEdits();
  return edits[musicId] || null;
}

/**
 * 楽曲の差分データを保存
 */
export function saveMusicEdit(edit: MusicEdit): void {
  try {
    const edits = getMusicEdits();
    edits[edit.id] = edit;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error("[musicStorage] Failed to save music edit:", error);
    throw error;
  }
}

/**
 * 特定の楽曲の差分データを削除
 */
export function removeMusicEdit(musicId: string): void {
  try {
    const edits = getMusicEdits();
    delete edits[musicId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error("[musicStorage] Failed to remove music edit:", error);
    throw error;
  }
}

/**
 * 元の楽曲データに差分データを適用して新しいMusicオブジェクトを返す
 */
export function applyMusicEdit(music: Music): Music {
  const edit = getMusicEdit(music.id);
  if (!edit) return music;

  return { ...music, ...edit };
}

/**
 * 楽曲リストに差分データを適用
 */
export function applyMusicEdits(musics: Music[]): Music[] {
  return musics.map(applyMusicEdit);
}

/**
 * 楽曲が編集されているかチェック
 */
export function isMusicEdited(musicId: string): boolean {
  return getMusicEdit(musicId) !== null;
}
