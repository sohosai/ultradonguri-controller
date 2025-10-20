import CmClock from "./CmClock";
import styles from "./CmMode.module.css";

import type { NextPerformance } from "../../types/performances";

type CmModeProps = {
  nextPerformances: NextPerformance[];
};

export default function CmMode({ nextPerformances }: CmModeProps) {
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
          <p className={styles.laterGuideTime}>12:30〜</p>
          <div className={styles.laterGuideRight}>
            <p className={styles.laterGuideTitle}>研究学園戦士ツクバダインショー</p>
            <p className={styles.laterGuidePerformer}>ヒーローアクション同好会</p>
          </div>
        </div>
      </div>
    </div>
  );
}
