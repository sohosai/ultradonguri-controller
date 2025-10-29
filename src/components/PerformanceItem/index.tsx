import { formatToMonthDay, formatToHourMinute } from "../../utils/dateFormat";

import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type Props = {
  performance: Performance;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: (performance: Performance) => void;
};

export default function PerformanceItem({ performance, isSelected, isPlaying, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(performance);
  };

  const monthDay = formatToMonthDay(performance.starts_at);
  const startTime = formatToHourMinute(performance.starts_at);
  const endTime = formatToHourMinute(performance.ends_at);

  return (
    <div className={styles.performance} data-selected={isSelected} data-playing={isPlaying} onClick={handleClick}>
      <div className={styles.itemHeader}>
        <div className={styles.time}>
          {monthDay} / {startTime}〜{endTime}
        </div>
        {isPlaying && <div className={styles.isPlaying}>再生中 ▶</div>}
      </div>
      <div className={styles.title}>{performance.title}</div>
    </div>
  );
}
