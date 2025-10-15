import type { NextPerformance } from "../../types/performances";

import styles from "./NextPerformances.module.css";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

export default function NextPerformances({ nextPerformances }: ConversionSceneProps) {
  return (
    <div className={styles.container}>
      {nextPerformances.slice(0, 3).map((performance, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.left}>
            <div className={styles.starts_at}>{performance.starts_at}</div>
            {index === 0 && <div className={styles.nextLabel}>NEXT</div>}
          </div>
          <div className={styles.right}>
            <div className={styles.title}>{performance.title}</div>
            {index === 0 && <div className={styles.performer}>{performance.performer}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
