import clsx from "clsx";
import { useState } from "react";

import { postMute } from "../../api/http/osechi";
import MuteToggle from "../MuteToggle";

import styles from "./index.module.css";

type Props = {
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
  onError?: (errorMessage: string) => void;
  isCmMode?: boolean;
  isConversion?: boolean;
};

export default function MuteControl({ isMuted, onMuteChange, onError, isCmMode, isConversion }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // コンバージョン中 & CM-mode のときは、ミュート(isMuted=false)のみ無効化
  const isCmMute = Boolean(isConversion && isCmMode && !isMuted);

  const openModal = () => {
    if (isCmMute) {
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
      const state = await postMute({ is_muted: !isMuted });
      onMuteChange(state.is_muted);
      closeModal();
    } catch (error) {
      console.error("[MuteControl] Failed to toggle mute:", error);
      onError?.("ミュート設定の変更に失敗しました");
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.copyright}>
        <div className={clsx(styles.copyrightTitle, isCmMute && styles.disabled)}>ミュート</div>
        <MuteToggle checked={isMuted} onChange={openModal} disabled={isCmMute} />
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p>確認:{isMuted ? "ミュートを解除" : "ミュート"}しますか？</p>
            <div className={styles.modalButtons}>
              <button className={styles.closeButton} onClick={closeModal}>
                キャンセル
              </button>
              <button className={styles.muteButton} onClick={handleMuteToggle} disabled={isSubmitting}>
                {isMuted ? "解除" : "ミュート"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
