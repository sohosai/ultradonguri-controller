import type { Performance } from "../types/performances";
import styles from "./Performance.module.css";

type Props = {
  performance: Performance;
};

export default function PerformanceItem({ performance }: Props) {
  return (
    <div className={styles.performance}>
      <div className={styles.time}>{performance.starts_at}〜{performance.ends_at}</div>
      <div className={styles.title}>{performance.title}</div>
    </div>
  );
}
