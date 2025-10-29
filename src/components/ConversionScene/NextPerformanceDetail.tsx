import { formatToHourMinute } from "../../utils/dateFormat";

import styles from "./NextPerformanceDetail.module.css";

import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

export default function NextPerformanceDetail({ nextPerformances }: ConversionSceneProps) {
  if (nextPerformances.length === 0) {
    return null;
  }

  const performance = nextPerformances[0];
  const startTime = formatToHourMinute(performance.starts_at);

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.left}>
          <div className={styles.starts_at}>{startTime}</div>
          <div className={styles.nextLabel}>NEXT</div>
        </div>
        <div className={styles.right}>
          <div className={styles.title}>{performance.title}</div>
          <div className={styles.performer}>{performance.performer}</div>
        </div>
      </div>
      <div className={styles.description}>{performance.description}</div>
    </div>
  );
}
