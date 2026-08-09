import { useState } from "react";

import { postForceMute } from "../../api/http/endpoints";
import MuteToggle from "../MuteToggle";

import styles from "./index.module.css";

type Props = {
  isForceMuted: boolean;
  onForceMuteChange: (isMuted: boolean) => void;
  onError?: (errorMessage: string) => void;
  isCmMode?: boolean;
  isConversion?: boolean;
  isUnmuteConfirmOpen?: boolean;
  onUnmuteConfirmClose?: () => void;
};

export default function ForceMute({
  isForceMuted,
  onForceMuteChange,
  onError,
  isCmMode,
  isConversion,
  isUnmuteConfirmOpen = false,
  onUnmuteConfirmClose,
}: Props) {
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
    onUnmuteConfirmClose?.();
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

  return (
    <>
      <div className={styles.copyright}>
        <div className={styles.copyrightTitle}>ミュート</div>
        <MuteToggle checked={isForceMuted} onChange={openModal} />
      </div>
      {(isModalOpen || isUnmuteConfirmOpen) && (
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
