import styles from "./SampleModal.module.css";

type SampleModalProps = {
  isOpen: boolean;
};

export default function SampleModal({ isOpen }: SampleModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h1>Sample Modal</h1>
      </div>
    </div>
  );
}
