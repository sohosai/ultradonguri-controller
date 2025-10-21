import { useEffect, useState } from "react";

import styles from "./Clock.module.css";

const formatTime = (d: Date) => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;
};

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.clockWrap} aria-label="現在時刻">
      <span className={styles.time}>{formatTime(now)}</span>
    </div>
  );
}
