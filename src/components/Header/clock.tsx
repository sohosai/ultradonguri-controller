import { useState, useEffect } from "react";

import styles from "./index.module.css";

const formatTime = (date: Date) => {
  const month = String(date.getMonth());
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `現在 ${month}/${day} ${hours}:${minutes}:${seconds}`;
};

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return <div className={styles.clock}>{formatTime(currentTime)}</div>;
};

export default Clock;
