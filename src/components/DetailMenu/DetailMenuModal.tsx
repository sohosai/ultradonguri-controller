import { useState, useEffect } from "react";

import styles from "./DetailMenuModal.module.css";

import type { Performance, Music } from "../../types/performances";

type DetailMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  performances: Performance[] | null;
};

export default function DetailMenuModal({ isOpen, onClose, performances }: DetailMenuModalProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);

  useEffect(() => {
    if (performances && performances.length > 0) {
      setSelectedPerformance(performances[0]);
      setSelectedMusic(performances[0].musics[0] || null);
    }
  }, [performances]);

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
                  <h3 className={styles.detailsTitle}>詳細編集</h3>
                  <div className={styles.detailItem}>
                    <label>タイトル</label>
                    <input type="text" className={styles.input} defaultValue={selectedMusic.title} />
                  </div>
                  <div className={styles.detailItem}>
                    <label>アーティスト</label>
                    <input type="text" className={styles.input} defaultValue={selectedMusic.artist} />
                  </div>
                  <div className={styles.detailItem}>
                    <label>ミュート設定</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="mute" value="false" defaultChecked={!selectedMusic.should_be_muted} />
                        配信OK
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="mute" value="true" defaultChecked={selectedMusic.should_be_muted} />
                        配信不可
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.buttons}>
            <button onClick={onClose}>キャンセル</button>
            <button>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
