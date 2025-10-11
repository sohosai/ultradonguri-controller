import { useState } from "react";

import usePerformances from "../../hooks/usePerformances";

import DetailMenuModal from "./DetailMenuModal";
import styles from "./index.module.css";

export default function DetailMenu() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const { performances } = usePerformances();

  return (
    <>
      <div className={styles.detailMenu}>
        <div className={styles.detailMenuButton} onClick={openModal}>
          楽曲詳細編集
        </div>
      </div>
      <DetailMenuModal isOpen={isModalOpen} onClose={closeModal} performances={performances} />
    </>
  );
}
