import { useEffect, useState } from "react";

import Clock from "./Clock";
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
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsExiting(true);
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const handleAnimationEnd = () => {
    if (isExiting) {
      setShowDetail((prev) => !prev);
      setIsExiting(false);
    }
  };

  if (isCmMode) {
    return <CmMode nextPerformances={nextPerformances} />;
  }

  return (
    <div className={styles.container}>
      {!isCmMode && <Clock />}
      <div className={styles.nextDetail}>
        <div className={isExiting ? styles.exit : styles.enter} onAnimationEnd={handleAnimationEnd}>
          {showDetail ? (
            <NextPerformanceDetail nextPerformances={nextPerformances} />
          ) : (
            <NextPerformances nextPerformances={nextPerformances} />
          )}
        </div>
      </div>
    </div>
  );
}
