import { useState } from "react";

import styles from "./index.module.css";

export default function ForceMute() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.tigerStripe}>
        <div className={styles.forceMute}>
          強制
          <br />
          ミュート
          <div className={styles.glass} onClick={openModal}></div>
        </div>
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <p>確認:ミュートしますか？</p>
            <div className={styles.modalButtons}>
            <button className={styles.closeButton} onClick={closeModal}>
              キャンセル
            </button>
            <button className={styles.muteButton}>
              ミュート
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
