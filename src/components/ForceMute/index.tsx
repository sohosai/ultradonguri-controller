import { useState } from "react";

import { postForceMute } from "../../api/http/endpoints";

import styles from "./index.module.css";

type Props = {
  isForceMuted: boolean;
  onForceMuteChange: (isMuted: boolean) => void;
  onError?: (errorMessage: string) => void;
  isCmMode?: boolean;
  isConversion?: boolean;
};

export default function ForceMute({ isForceMuted, onForceMuteChange, onError, isCmMode, isConversion }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    // コンバージョン中 & CM-mode のときは、強制ミュート(isForceMuted=false)のみ無効化
    if (isConversion && isCmMode && !isForceMuted) {
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleMuteToggle = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newMuteState = !isForceMuted;
      await postForceMute({ is_muted: newMuteState });
      onForceMuteChange(newMuteState);
      closeModal();
    } catch (error) {
      console.error("[ForceMute] Failed to toggle force mute:", error);
      onError?.("ミュート設定の変更に失敗しました");
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isConversion && isCmMode && !isForceMuted;

  return (
    <>
      <div className={styles.tigerStripe}>
        <div className={`${styles.forceMute} ${isDisabled ? styles.disabled : ""}`}>
          強制
          <br />
          {isForceMuted ? "ミュート解除" : "ミュート"}
          <div className={styles.glass} onClick={openModal}></div>
        </div>
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p>確認:{isForceMuted ? "ミュートを解除" : "ミュート"}しますか？</p>
            <div className={styles.modalButtons}>
              <button className={styles.closeButton} onClick={closeModal}>
                キャンセル
              </button>
              <button className={styles.muteButton} onClick={handleMuteToggle} disabled={isSubmitting}>
                {isForceMuted ? "解除" : "ミュート"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
