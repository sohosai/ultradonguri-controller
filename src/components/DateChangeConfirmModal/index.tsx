import styles from "./index.module.css";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DateChangeConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p>確認:日付を変更しますか？</p>
        <div className={styles.modalButtons}>
          <button className={styles.closeButton} onClick={onCancel}>
            キャンセル
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            変更
          </button>
        </div>
      </div>
    </div>
  );
}
