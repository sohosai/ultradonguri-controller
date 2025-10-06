import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type Props = {
  performance: Performance;
  onSelect?: (performance: Performance) => void;
};

export default function PerformanceItem({ performance, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(performance);
  };

  return (
    <div className={styles.performance} onClick={handleClick}>
      <div className={styles.time}>
        {performance.starts_at}〜{performance.ends_at}
      </div>
      <div className={styles.title}>{performance.title}</div>
    </div>
  );
}
