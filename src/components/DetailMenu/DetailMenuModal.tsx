import { useState } from "react";

import styles from "./DetailMenuModal.module.css";

import type { Performance, Music } from "../../types/performances";

type DetailMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  performances: Performance[] | null;
};

export default function DetailMenuModal({ isOpen, onClose, performances }: DetailMenuModalProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(
    performances ? performances[0] : null
  );
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(
    selectedPerformance ? selectedPerformance.musics[0] : null
  );

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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}></div>
        <div className={styles.modalBody}>
          <div className={styles.performances}>
            <h3>パフォーマンス一覧</h3>
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
            <h3>楽曲一覧</h3>
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
              <>
                <h3>楽曲詳細</h3>
                <div className={styles.detailItem}>
                  <label>タイトル:</label>
                  <span>{selectedMusic.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>アーティスト:</label>
                  <span>{selectedMusic.artist}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>ミュート設定:</label>
                  <span>{selectedMusic.should_be_muted ? "ミュート" : "通常"}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>イントロ:</label>
                  <span>{selectedMusic.intro}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
