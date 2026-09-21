import { useState } from "react";

import styles from "./AddGroupModal.module.css";

type AddGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddGroupModal({ isOpen, onClose }: AddGroupModalProps) {
  const [groupName, setGroupName] = useState("");

  const hasEdits = groupName !== "";

  const closeModal = () => {
    setGroupName("");
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
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>団体追加メニュー</div>
        <div className={styles.modalBody}>
          <div className={styles.items}>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <label>団体名</label>
                <input
                  type="text"
                  className={styles.input}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
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
