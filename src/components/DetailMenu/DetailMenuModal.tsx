import { useState, useEffect } from "react";

import DownSvg from "../../assets/icons/down.svg";
import TrashSvg from "../../assets/icons/trash.svg";
import UpSvg from "../../assets/icons/up.svg";

import AddGroupModal from "./AddGroupModal.tsx";
import AddMusicModal from "./AddMusicModal.tsx";
import styles from "./DetailMenuModal.module.css";

import type { Performance, Music } from "../../types/performances";

type DetailMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  performances: Performance[] | null;
  onSave: (next: Performance[]) => void;
};

type MusicEdits = {
  title: string;
  artist: string;

  should_be_muted: boolean;
};

function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];

  return next;
}

export default function DetailMenuModal({ isOpen, onClose, performances, onSave }: DetailMenuModalProps) {
  // 保存するまでの編集中リスト（並び替え・追加・削除はここに反映）
  const [draft, setDraft] = useState<Performance[]>([]);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Map<string, MusicEdits>>(new Map());
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddMusicModalOpen, setIsAddMusicModalOpen] = useState(false);

  useEffect(() => {
    const list = performances ?? [];
    setDraft(list);
    setSelectedPerformanceId(list[0]?.id ?? null);
    setSelectedMusicId(list[0]?.musics[0]?.id ?? null);
  }, [performances]);

  const selectedPerformance = draft.find((p) => p.id === selectedPerformanceId) ?? null;
  const selectedMusic = selectedPerformance?.musics.find((m) => m.id === selectedMusicId) ?? null;
  const hasChanges = pendingEdits.size > 0 || draft !== performances;

  // 現在選択中の楽曲の編集内容を取得（未保存の編集 or 元の値）
  const getCurrentEdits = (music: Music): MusicEdits => {
    const pending = pendingEdits.get(music.id);
    if (pending) return pending;

    return {
      title: music.title,
      artist: music.artist,
      should_be_muted: music.should_be_muted,
    };
  };

  const currentEdits = selectedMusic ? getCurrentEdits(selectedMusic) : null;

  // 編集内容を更新
  const updateEdits = (musicId: string, updates: Partial<MusicEdits>) => {
    setPendingEdits((prev) => {
      const newMap = new Map(prev);
      const current = selectedMusic ? getCurrentEdits(selectedMusic) : null;
      if (!current) return prev;

      newMap.set(musicId, { ...current, ...updates });

      return newMap;
    });
  };

  const handlePerformanceSelect = (performanceId: string) => {
    const performance = draft.find((p) => p.id === performanceId);
    if (performance) {
      setSelectedPerformanceId(performance.id);
      setSelectedMusicId(performance.musics[0]?.id ?? null);
    }
  };

  const handleMusicSelect = (musicId: string) => {
    setSelectedMusicId(musicId);
  };

  const movePerformance = (performanceId: string, delta: number) => {
    setDraft(
      moveItem(
        draft,
        draft.findIndex((p) => p.id === performanceId),
        delta
      )
    );
  };

  const deletePerformance = (performanceId: string) => {
    const next = draft.filter((p) => p.id !== performanceId);
    setDraft(next);
    if (selectedPerformanceId === performanceId) {
      setSelectedPerformanceId(next[0]?.id ?? null);
      setSelectedMusicId(next[0]?.musics[0]?.id ?? null);
    }
  };

  const addPerformance = (title: string) => {
    const base = selectedPerformance ?? draft[draft.length - 1];
    const now = new Date().toISOString();
    const performance: Performance = {
      id: crypto.randomUUID(),
      title,
      performer: "",
      description: "",
      starts_at: base?.starts_at ?? now,
      ends_at: base?.ends_at ?? now,
      musics: [],
    };
    const index = selectedPerformance ? draft.indexOf(selectedPerformance) + 1 : draft.length;
    setDraft([...draft.slice(0, index), performance, ...draft.slice(index)]);
    setSelectedPerformanceId(performance.id);
    setSelectedMusicId(null);
  };

  // 選択中の団体の楽曲リストを差し替える
  const updateSelectedMusics = (updater: (musics: Music[]) => Music[]) => {
    setDraft(draft.map((p) => (p.id === selectedPerformanceId ? { ...p, musics: updater(p.musics) } : p)));
  };

  const moveMusic = (musicId: string, delta: number) => {
    updateSelectedMusics((musics) =>
      moveItem(
        musics,
        musics.findIndex((m) => m.id === musicId),
        delta
      )
    );
  };

  const deleteMusic = (musicId: string) => {
    updateSelectedMusics((musics) => musics.filter((m) => m.id !== musicId));
    if (selectedMusicId === musicId) {
      setSelectedMusicId(null);
    }
  };

  const addMusic = (title: string, artist: string) => {
    const music: Music = { id: crypto.randomUUID(), title, artist, should_be_muted: false, intro: "" };
    updateSelectedMusics((musics) => [...musics, music]);
    setSelectedMusicId(music.id);
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm("今の変更は保存されていません。変更を破棄しますか？")) {
        return;
      }
    }
    setPendingEdits(new Map());
    setDraft(performances ?? []);
    onClose();
  };

  const handleSave = () => {
    if (hasChanges) {
      onSave(
        draft.map((p) => ({
          ...p,
          musics: p.musics.map((m) => {
            const edits = pendingEdits.get(m.id);

            return edits ? { ...m, ...edits } : m;
          }),
        }))
      );
    }

    setPendingEdits(new Map());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleCancel}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>詳細編集メニュー</div>
          <div className={styles.modalBody}>
            <div className={styles.items}>
              <div className={styles.performances}>
                <ul>
                  {draft.map((p) => (
                    <li
                      key={p.id}
                      className={selectedPerformanceId === p.id ? styles.selected : ""}
                      onClick={() => handlePerformanceSelect(p.id)}>
                      <div className={styles.actions}>
                        <div className={styles.performancetitle}>{p.title}</div>
                        <div className={styles.actionbuttons} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.up} onClick={() => movePerformance(p.id, -1)}>
                            <img src={UpSvg} alt="上へ" className={styles.side} />
                          </div>
                          <div className={styles.down} onClick={() => movePerformance(p.id, 1)}>
                            <img src={DownSvg} alt="下へ" className={styles.side} />
                          </div>
                          <div className={styles.trash} onClick={() => deletePerformance(p.id)}>
                            <img src={TrashSvg} alt="削除" className={styles.side} />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.musics}>
                <ul>
                  {selectedPerformance?.musics.map((m) => (
                    <li
                      key={m.id}
                      className={selectedMusicId === m.id ? styles.selected : ""}
                      onClick={() => handleMusicSelect(m.id)}>
                      <div className={styles.actions}>
                        <div className={styles.musictitle}>
                          {m.title}
                          {pendingEdits.has(m.id) && <span className={styles.editedMark}>*</span>}
                        </div>
                        <div className={styles.actionbuttons} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.up} onClick={() => moveMusic(m.id, -1)}>
                            <img src={UpSvg} alt="上へ" className={styles.side} />
                          </div>
                          <div className={styles.down} onClick={() => moveMusic(m.id, 1)}>
                            <img src={DownSvg} alt="下へ" className={styles.side} />
                          </div>
                          <div className={styles.trash} onClick={() => deleteMusic(m.id)}>
                            <img src={TrashSvg} alt="削除" className={styles.side} />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.details}>
                {selectedMusic && (
                  <div key={selectedMusic.id}>
                    <div className={styles.detailsHeader}>
                      <h3 className={styles.detailsTitle}>詳細編集</h3>
                    </div>
                    <h4 className={styles.editGroup}>団体</h4>
                    <div className={styles.detailItem}>
                      <label>タイトル</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={currentEdits?.title || ""}
                        onChange={(e) => updateEdits(selectedMusic.id, { title: e.target.value })}
                      />
                    </div>
                    <h4 className={styles.editMusic}>楽曲</h4>
                    <div className={styles.detailItem}>
                      <label>タイトル</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={currentEdits?.title || ""}
                        onChange={(e) => updateEdits(selectedMusic.id, { title: e.target.value })}
                      />
                    </div>
                    <div className={styles.detailItem}>
                      <label>アーティスト</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={currentEdits?.artist || ""}
                        onChange={(e) => updateEdits(selectedMusic.id, { artist: e.target.value })}
                      />
                    </div>
                    <div className={styles.detailItem}>
                      <label>ミュート設定</label>
                      <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="mute"
                            value="false"
                            checked={!currentEdits?.should_be_muted}
                            onChange={() => updateEdits(selectedMusic.id, { should_be_muted: false })}
                          />
                          配信OK
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="mute"
                            value="true"
                            checked={currentEdits?.should_be_muted}
                            onChange={() => updateEdits(selectedMusic.id, { should_be_muted: true })}
                          />
                          配信不可
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.buttons}>
              <button className={styles.addgroup} onClick={() => setIsAddGroupModalOpen(true)}>
                団体追加
              </button>
              <button
                className={styles.addmusic}
                onClick={() => setIsAddMusicModalOpen(true)}
                disabled={!selectedPerformance}>
                楽曲追加
              </button>
              <button className={styles.cancel} onClick={handleCancel}>
                キャンセル
              </button>
              <button className={styles.save} onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onSave={addPerformance}
      />
      <AddMusicModal isOpen={isAddMusicModalOpen} onClose={() => setIsAddMusicModalOpen(false)} onSave={addMusic} />
    </>
  );
}
