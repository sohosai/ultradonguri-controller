import { useState, useEffect } from "react";

import { saveMusicEdit, removeMusicEdit, isMusicEdited } from "../../lib/musicStorage";

import styles from "./DetailMenuModal.module.css";

import type { Performance, Music } from "../../types/performances";

type DetailMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  performances: Performance[] | null;
  onSave?: () => void;
};

export default function DetailMenuModal({ isOpen, onClose, performances, onSave }: DetailMenuModalProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedArtist, setEditedArtist] = useState<string>("");
  const [editedShouldBeMuted, setEditedShouldBeMuted] = useState<boolean>(false);

  useEffect(() => {
    if (performances && performances.length > 0) {
      setSelectedPerformance(performances[0]);
      setSelectedMusic(performances[0].musics[0] || null);
    }
  }, [performances]);

  // 選択された楽曲が変更されたら、編集フォームの値を更新
  useEffect(() => {
    if (selectedMusic) {
      setEditedTitle(selectedMusic.title);
      setEditedArtist(selectedMusic.artist);
      setEditedShouldBeMuted(selectedMusic.should_be_muted);
    }
  }, [selectedMusic]);

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
    if (!selectedMusic) return;

    const hasChanges =
      editedTitle !== selectedMusic.title ||
      editedArtist !== selectedMusic.artist ||
      editedShouldBeMuted !== selectedMusic.should_be_muted;

    if (hasChanges) {
      saveMusicEdit({
        id: selectedMusic.id,
        title: editedTitle,
        artist: editedArtist,
        should_be_muted: editedShouldBeMuted,
      });
      onSave?.();
    }

    onClose();
  };

  const handleResetEdit = () => {
    if (!selectedMusic || !window.confirm("この楽曲の編集内容をリセットしますか?")) return;

    removeMusicEdit(selectedMusic.id);
    setEditedTitle(selectedMusic.title);
    setEditedArtist(selectedMusic.artist);
    setEditedShouldBeMuted(selectedMusic.should_be_muted);
    onSave?.();
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
                    {isMusicEdited(m.id) && <span style={{ marginLeft: "0.5rem", color: "#ff6b6b" }}>●</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.details}>
              {selectedMusic && (
                <div key={selectedMusic.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className={styles.detailsTitle}>詳細編集</h3>
                    {isMusicEdited(selectedMusic.id) && (
                      <button
                        onClick={handleResetEdit}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.8rem",
                          backgroundColor: "#ff6b6b",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}>
                        編集をリセット
                      </button>
                    )}
                  </div>
                  <div className={styles.detailItem}>
                    <label>タイトル</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>アーティスト</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={editedArtist}
                      onChange={(e) => setEditedArtist(e.target.value)}
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
                          checked={!editedShouldBeMuted}
                          onChange={() => setEditedShouldBeMuted(false)}
                        />
                        配信OK
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="mute"
                          value="true"
                          checked={editedShouldBeMuted}
                          onChange={() => setEditedShouldBeMuted(true)}
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
