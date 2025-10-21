import { useState, useEffect } from "react";

const formatTime = (date: Date): { hours: string; minutes: string } => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return { hours, minutes };
};

const CmClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isColonVisible, setIsColonVisible] = useState(true);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);
  useEffect(() => {
    const blinkId = setInterval(() => {
      setIsColonVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(blinkId);
  }, []);

  const { hours, minutes } = formatTime(currentTime);
  const colon = isColonVisible ? ":" : " ";

  return (
    <>
      <span>{hours}</span>
      <span style={{ width: "15px", display: "Block", textAlign: "center" }}>{colon}</span>
      <span>{minutes}</span>
    </>
  );
};

export default CmClock;
