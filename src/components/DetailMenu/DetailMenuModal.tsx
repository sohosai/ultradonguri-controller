import { useState, useEffect } from "react";

import { saveMusicEdit } from "../../lib/musicStorage";

import styles from "./DetailMenuModal.module.css";

import type { Performance, Music } from "../../types/performances";

type DetailMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  performances: Performance[] | null;
  originalPerformances: Performance[] | null;
  onSave?: () => void;
};

type MusicEdits = {
  title: string;
  artist: string;

  should_be_muted: boolean;
};

export default function DetailMenuModal({
  isOpen,
  onClose,
  performances,
  originalPerformances,
  onSave,
}: DetailMenuModalProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Map<string, MusicEdits>>(new Map());

  useEffect(() => {
    if (performances && performances.length > 0) {
      setSelectedPerformance(performances[0]);
      setSelectedMusic(performances[0].musics[0] || null);
    }
  }, [performances]);

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
    const performance = performances?.find((p) => p.id === performanceId);
    if (performance) {
      setSelectedPerformance(performance);
      setSelectedMusic(performance.musics[0] || null);
    }
  };

  const handleMusicSelect = (musicId: string) => {
    const music = selectedPerformance?.musics.find((m) => m.id === musicId);
    if (music) {
      setSelectedMusic(music);
    }
  };

  const handleSave = () => {
    // 事前にMusicIDをキーとしたMapを作成
    const originalMusicMap = new Map<string, Music>();
    for (const perf of originalPerformances || []) {
      for (const music of perf.musics) {
        originalMusicMap.set(music.id, music);
      }
    }

    // 全ての未保存の編集をlocalStorageに保存
    pendingEdits.forEach((edits, musicId) => {
      const originalMusic = originalMusicMap.get(musicId);
      if (originalMusic) {
        saveMusicEdit(
          {
            id: musicId,
            title: edits.title,
            artist: edits.artist,
            should_be_muted: edits.should_be_muted,
          },
          originalMusic
        );
      }
    });

    if (pendingEdits.size > 0) {
      onSave?.();
    }

    setPendingEdits(new Map());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>詳細編集メニュー</div>
        <div className={styles.modalBody}>
          <div className={styles.items}>
            <div className={styles.performances}>
              <ul>
                {performances?.map((p) => (
                  <li
                    key={p.id}
                    className={selectedPerformance?.id === p.id ? styles.selected : ""}
                    onClick={() => handlePerformanceSelect(p.id)}>
                    {p.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.musics}>
              <ul>
                {selectedPerformance?.musics.map((m) => (
                  <li
                    key={m.id}
                    className={selectedMusic?.id === m.id ? styles.selected : ""}
                    onClick={() => handleMusicSelect(m.id)}>
                    {m.title}
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
            <button className={styles.cancel} onClick={onClose}>
              キャンセル
            </button>
            <button className={styles.save} onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
