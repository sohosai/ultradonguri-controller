import { useEffect, useState } from "react";

import CmClock from "./CmClock";
import styles from "./CmMode.module.css";

import type { NextPerformance } from "../../types/performances";
import { formatToHourMinute } from "../../utils/dateFormat";

type CmModeProps = {
  nextPerformances: NextPerformance[];
};

export default function CmMode({ nextPerformances }: CmModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (nextPerformances.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nextPerformances.length);
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, [nextPerformances.length]);

  const currentPerformance = nextPerformances[currentIndex] || nextPerformances[0];
  const nextStartTime = formatToHourMinute(nextPerformances[0].starts_at);
  const currentStartTime = formatToHourMinute(currentPerformance.starts_at);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topGuides}>
          <div className={styles.clock}>
            <CmClock />
          </div>
          <div className={styles.nextGuide}>
            <p className={styles.nextGuideTime}>{nextStartTime}〜</p>
            <p className={styles.nextGuideTitle}>{nextPerformances[0].title}</p>
            <p className={styles.nextGuideperformer}>{nextPerformances[0].performer}</p>
            <p className={styles.nextGuideDescription}>{nextPerformances[0].description}</p>
          </div>
        </div>
        <div className={styles.broadcast}></div>
      </div>
      <div className={styles.bottom}>
        <div key={currentIndex} className={styles.laterGuide}>
          <p className={styles.laterGuideTime}>{currentStartTime}〜</p>
          <div className={styles.laterGuideRight}>
            <p className={styles.laterGuideTitle}>
              {currentPerformance.title} <p className={styles.laterGuidePerformer}>{currentPerformance.performer}</p>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
