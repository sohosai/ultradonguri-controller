import styles from "./CmMode.module.css";

import type { NextPerformance } from "../../types/performances";

type CmModeProps = {
  nextPerformances: NextPerformance[];
};

export default function CmMode({ nextPerformances }: CmModeProps) {
  return (
    <div className={styles.container}>
      <div className={styles.text}>CM</div>
      <div className={styles.debugInfo}>
        {nextPerformances.map((performance, index) => (
          <div key={index}>
            {performance.starts_at} - {performance.title} ({performance.performer})
          </div>
        ))}
      </div>
    </div>
  );
}
