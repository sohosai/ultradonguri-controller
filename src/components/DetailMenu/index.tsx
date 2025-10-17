import { useState } from "react";

import DetailMenuModal from "./DetailMenuModal";
import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type DetailMenuProps = {
  performances: Performance[] | null;
  onRefresh: () => Promise<void>;
};

export default function DetailMenu({ performances, onRefresh }: DetailMenuProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    // 保存後にパフォーマンスデータを再取得して差分を反映
    void onRefresh();
  };

  return (
    <>
      <div className={styles.detailMenu}>
        <div className={styles.detailMenuButton} onClick={openModal}>
          楽曲詳細編集
        </div>
      </div>
      <DetailMenuModal isOpen={isModalOpen} onClose={closeModal} performances={performances} onSave={handleSave} />
    </>
  );
}
