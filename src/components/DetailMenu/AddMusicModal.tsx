import { useState } from "react";

import styles from "./AddModal.module.css";

type AddMusicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, artist: string) => void;
};

export default function AddMusicModal({ isOpen, onClose, onSave }: AddMusicModalProps) {
  const [musicTitle, setMusicTitle] = useState("");
  const [artistName, setArtistName] = useState("");

  const hasEdits = musicTitle !== "" || artistName !== "";

  const closeModal = () => {
    setMusicTitle("");
    setArtistName("");
    onClose();
  };

  const handleCancel = () => {
    if (hasEdits) {
      if (!confirm("今の変更は保存されていません。変更を破棄しますか？")) {
        return;
      }
    }
    closeModal();
  };

  const handleSave = () => {
    if (!musicTitle.trim()) return;
    onSave(musicTitle.trim(), artistName.trim());
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>楽曲追加メニュー</div>
        <div className={styles.modalBody}>
          <div className={styles.items}>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <label>楽曲名</label>
                <input
                  type="text"
                  className={styles.input}
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                />
              </div>
              <div className={styles.detailItem}>
                <label>アーティスト名</label>
                <input
                  type="text"
                  className={styles.input}
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={styles.buttons}>
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
  );
}
