import { useEffect, useRef } from "react";

import { burariVideoUrl } from "../../api/http/burariVideos";

import styles from "./BurariPlayer.module.css";

type Props = {
  filename: string;
  onEnded: () => void;
};

export default function BurariPlayer({ filename, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch((e) => {
      console.error("[BurariPlayer] Auto-play failed:", e);
    });
  }, [filename]);

  return (
    <div className={styles.overlay}>
      <video
        ref={videoRef}
        src={burariVideoUrl(filename)}
        className={styles.video}
        autoPlay
        playsInline
        onEnded={onEnded}
      />
    </div>
  );
}
