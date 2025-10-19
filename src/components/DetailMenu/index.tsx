import { useState } from "react";

import DetailMenuModal from "./DetailMenuModal";
import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type DetailMenuProps = {
  performances: Performance[] | null;
  originalPerformances: Performance[] | null;
  onRefresh: () => Promise<void>;
};

export default function DetailMenu({ performances, originalPerformances, onRefresh }: DetailMenuProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.detailMenu}>
        <div className={styles.detailMenuButton} onClick={() => setIsModalOpen(true)}>
          楽曲詳細編集
        </div>
      </div>
      <DetailMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        performances={performances}
        originalPerformances={originalPerformances}
        onSave={() => void onRefresh()}
      />
    </>
  );
}
