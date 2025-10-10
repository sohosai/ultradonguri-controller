import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type Props = {
  performance: Performance;
  isSelected?: boolean;
  onSelect?: (performance: Performance) => void;
};

export default function PerformanceItem({ performance, isSelected, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(performance);
  };

  return (
    <div className={styles.performance} data-selected={isSelected} onClick={handleClick}>
      <div className={styles.time}>
        {performance.starts_at}〜{performance.ends_at}
      </div>
      <div className={styles.title}>{performance.title}</div>
    </div>
  );
}
