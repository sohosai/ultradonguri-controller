import { useEffect, useState } from "react";

import styles from "./index.module.css";
import NextPerformanceDetail from "./NextPeformanceDetail";
import NextPerformances from "./NextPerformances";
import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

const SWITCH_INTERVAL = 7000; // 7秒ごとに切り替え

export default function ConversionScene({ nextPerformances }: ConversionSceneProps) {
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowDetail((prev) => !prev);
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.nextDetail}>
        {showDetail ? (
          <NextPerformanceDetail nextPerformances={nextPerformances} />
        ) : (
          <NextPerformances nextPerformances={nextPerformances} />
        )}
      </div>
    </div>
  );
}
