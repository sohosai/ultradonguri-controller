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
