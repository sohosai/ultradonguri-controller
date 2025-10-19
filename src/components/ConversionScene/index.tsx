import { useEffect, useState } from "react";

import CmMode from "./CmMode";
import styles from "./index.module.css";
import NextPerformanceDetail from "./NextPerformanceDetail";
import NextPerformances from "./NextPerformances";

import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
  isCmMode: boolean;
};

const SWITCH_INTERVAL = 10000; // 10秒ごとに切り替え

export default function ConversionScene({ nextPerformances, isCmMode }: ConversionSceneProps) {
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowDetail((prev) => !prev);
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  if (isCmMode) {
    return <CmMode />;
  }

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
