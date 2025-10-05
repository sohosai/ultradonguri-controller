import type { Performance } from "../types/performances";
import styles from "./PerformanceItem.module.css";

type Props = {
  performance: Performance;
  onSelect?: (performance: Performance) => void;
};

export default function PerformanceItem({ performance, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(performance);
  };
  return (
    <div
      className={styles.performance}
      role="button"
      tabIndex={0}
      onClick={handleClick}
    >
      <div className={styles.time}>{performance.starts_at}〜{performance.ends_at}</div>
      <div className={styles.title}>{performance.title}</div>
    </div>
  );
}
