import type { NextPerformance } from "../../types/performances";

import styles from "./NextPerformanceDetail.module.css";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

export default function NextPerformanceDetail({ nextPerformances }: ConversionSceneProps) {
  const performance = nextPerformances[0];

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.left}>
          <div className={styles.starts_at}>{performance.starts_at}</div>
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
