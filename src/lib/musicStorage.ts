import type { Music } from "../types/performances";

const STORAGE_KEY = "music-edits";

export type MusicEdit = {
  id: string;
  title?: string;
  artist?: string;
  should_be_muted?: boolean;
};

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

export function saveMusicEdit(edit: MusicEdit, originalMusic: Music): void {
  try {
    // 元データと比較して差分をチェック
    const hasTitleDiff = edit.title !== undefined && edit.title !== originalMusic.title;
    const hasArtistDiff = edit.artist !== undefined && edit.artist !== originalMusic.artist;
    const hasMuteDiff = edit.should_be_muted !== undefined && edit.should_be_muted !== originalMusic.should_be_muted;

    const hasDiff = hasTitleDiff || hasArtistDiff || hasMuteDiff;

    // 差分がない場合はlocalStorageから削除
    if (!hasDiff) {
      removeMusicEdit(edit.id);

      return;
    }

    // 差分がある項目のみを保存
    const editToSave: MusicEdit = { id: edit.id };
    if (hasTitleDiff) editToSave.title = edit.title;
    if (hasArtistDiff) editToSave.artist = edit.artist;
    if (hasMuteDiff) editToSave.should_be_muted = edit.should_be_muted;

    const edits = getMusicEdits();
    edits[edit.id] = editToSave;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error("[musicStorage] Failed to save music edit:", error);
    throw error;
  }
}

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

export function applyMusicEdit(music: Music): Music {
  const edit = getMusicEdit(music.id);
  if (!edit) return music;

  return { ...music, ...edit };
}

export function applyMusicEdits(musics: Music[]): Music[] {
  return musics.map(applyMusicEdit);
}

export function isMusicEdited(musicId: string): boolean {
  return getMusicEdit(musicId) !== null;
}
