import type { Performance } from "../types/performances";

const STORAGE_KEY = "performance-edits";

export type PerformanceEdit = {
  id: string;
  performer?: string;
};

type PerformanceEditsStorage = {
  [performanceId: string]: PerformanceEdit;
};

function getPerformanceEdits(): PerformanceEditsStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    return JSON.parse(stored) as PerformanceEditsStorage;
  } catch (error) {
    console.error("[performanceStorage] Failed to parse performance edits:", error);
    return {};
  }
}

function getPerformanceEdit(id: string): PerformanceEdit | null {
  const edits = getPerformanceEdits();

  return edits[id] || null;
}

export function savePerformanceEdit(
  edit: PerformanceEdit,
  originalPerformance: Performance,
): void {
  try {
    const hasPerformerDiff =
      edit.performer !== undefined &&
      edit.performer !== originalPerformance.performer;

    if (!hasPerformerDiff) {
      removePerformanceEdit(edit.id);
      return;
    }

    const editToSave: PerformanceEdit = {
      id: edit.id,
      performer: edit.performer,
    };

    const edits = getPerformanceEdits();
    edits[edit.id] = editToSave;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error("[performanceStorage] Failed to save performance edit:", error);
    throw error;
  }
}

export function removePerformanceEdit(id: string): void {
  try {
    const edits = getPerformanceEdits();
    delete edits[id];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error("[performanceStorage] Failed to remove performance edit:", error);
    throw error;
  }
}

export function applyPerformanceEdit(
  performance: Performance,
): Performance {
  const edit = getPerformanceEdit(performance.id);

  if (!edit) return performance;

  return {
    ...performance,
    ...edit,
  };
}

export function applyPerformanceEdits(
  performances: Performance[],
): Performance[] {
  return performances.map(applyPerformanceEdit);
}

export function isPerformanceEdited(id: string): boolean {
  return getPerformanceEdit(id) !== null;
}