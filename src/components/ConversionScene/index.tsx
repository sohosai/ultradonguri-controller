import { useEffect, useState } from "react";

import CmMode from "./CmMode";
import styles from "./index.module.css";
import NextPerformanceDetail from "./NextPerformanceDetail";
import detailStyles from "./NextPerformanceDetail.module.css";
import NextPerformances from "./NextPerformances";
import performancesStyles from "./NextPerformances.module.css";

import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
  isCmMode: boolean;
};

const SWITCH_INTERVAL = 10000; // 10秒ごとに切り替え
const ANIMATION_DURATION = 1000; // アニメーション時間（ミリ秒）

export default function ConversionScene({ nextPerformances, isCmMode }: ConversionSceneProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationState, setAnimationState] = useState<"in" | "out">("in");

  useEffect(() => {
    // 初回マウント時のアニメーション
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);

    const timer = setInterval(() => {
      setIsAnimating(true);
      setAnimationState("out");

      setTimeout(() => {
        setShowDetail((prev) => !prev);
        setAnimationState("in");
        setTimeout(() => {
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      }, ANIMATION_DURATION);
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  if (isCmMode) {
    return <CmMode nextPerformances={nextPerformances} />;
  }

  const getAnimationClass = () => {
    if (!isAnimating) return "";

    return animationState === "in"
      ? showDetail
        ? detailStyles.slideIn
        : performancesStyles.slideIn
      : showDetail
        ? performancesStyles.slideOut
        : detailStyles.slideOut;
  };

  return (
    <div className={styles.container}>
      <div className={styles.nextDetail}>
        <div className={getAnimationClass()}>
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
