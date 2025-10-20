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
          <div className={styles.nextGuide}>次の団体の紹介部分</div>
        </div>
        <div className={styles.broadcast}>配信画面</div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.laterGuide}>次以降の団体の紹介</div>
      </div>
    </div>
  );
}
