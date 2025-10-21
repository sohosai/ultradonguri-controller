import { useEffect, useState } from "react";
import CmClock from "./CmClock";
import styles from "./CmMode.module.css";

import type { NextPerformance } from "../../types/performances";

type CmModeProps = {
  nextPerformances: NextPerformance[];
};

export default function CmMode({ nextPerformances }: CmModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (nextPerformances.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nextPerformances.length);
    }, 10000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, [nextPerformances.length]);

  const currentPerformance = nextPerformances[currentIndex] || nextPerformances[0];

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topGuides}>
          <div className={styles.clock}>
            <CmClock />
          </div>
          <div className={styles.nextGuide}>
            <p className={styles.nextGuideTime}>{nextPerformances[0].starts_at}〜</p>
            <p className={styles.nextGuideTitle}>{nextPerformances[0].title}</p>
            <p className={styles.nextGuideperformer}>{nextPerformances[0].performer}</p>
            <p className={styles.nextGuideDescription}>{nextPerformances[0].description}</p>
          </div>
        </div>
        <div className={styles.broadcast}></div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.laterGuide}>
          <p className={styles.laterGuideTime}>{currentPerformance.starts_at}〜</p>
          <div className={styles.laterGuideRight}>
            <p className={styles.laterGuideTitle}>{currentPerformance.title}</p>
            <p className={styles.laterGuidePerformer}>{currentPerformance.performer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
