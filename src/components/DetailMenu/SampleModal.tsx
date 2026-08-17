import styles from "./SampleModal.module.css";

type SampleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};


export default function SampleModal({ 
  isOpen,
  onClose,
 }: SampleModalProps) {
  const handleCancel = () => {
    onClose();
  }
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>団体追加メニュー</div>
        <div className={styles.modalBody}>
          <div className={styles.items}>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <label>団体名</label>
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
