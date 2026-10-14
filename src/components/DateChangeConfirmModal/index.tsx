import styles from "./index.module.css";

type Props = {
  currentDateKey: string; // YYYY-MM-DD
  nextDateKey: string; // YYYY-MM-DD
  onConfirm: () => void;
  onCancel: () => void;
};

// "2026-11-01" -> "11/1"
const formatToSlashMonthDay = (ymd: string): string => {
  const [, month, day] = ymd.split("-");

  return `${Number(month)}/${Number(day)}`;
};

export default function DateChangeConfirmModal({ currentDateKey, nextDateKey, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p>日付を変更しますか？</p>
        <p className={styles.dates}>
          現在：{formatToSlashMonthDay(currentDateKey)}
          {"\u3000"}変更後：{formatToSlashMonthDay(nextDateKey)}
        </p>
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
