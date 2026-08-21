import styles from "./AddMusicModal.module.css";

type AddMusicModalProps = {
  isOpen: boolean;
  onClose: () => void;
};


export default function AddMusicModal({ 
  isOpen,
  onClose,
 }: AddMusicModalProps) {
  const handleCancel = () => {
    onClose();
  }
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>楽曲追加メニュー</div>
        <div className={styles.modalBody}>
          <div className={styles.items}>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <label>楽曲名</label>
                <input type="text" className={styles.input} />
              </div>
              <div className={styles.detailItem}>
                <label>アーティスト名</label>
                <input type="text" className={styles.input} />
              </div>
            </div>
          </div>
          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={handleCancel}>キャンセル</button>
            <button className={styles.save}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
