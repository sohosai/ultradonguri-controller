import { useEffect, useRef, useState } from "react";

import { burariVideoUrl } from "../../api/http/burariVideos";

import styles from "./BurariPlayer.module.css";

type Props = {
  filename: string;
  onEnded: () => void;
};

export default function BurariPlayer({ filename, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch((e) => {
      console.error("[BurariPlayer] Auto-play failed:", e);
    });
  }, [filename]);

  return (
    <div className={`${styles.overlay} ${isReady ? styles.visible : styles.hidden}`}>
      {!isReady && (
        <div className={styles.loading}>動画読み込み中...</div>
      )}
      <video
        ref={videoRef}
        src={burariVideoUrl(filename)}
        className={styles.video}
        autoPlay
        playsInline
        onEnded={onEnded}
        onCanPlay={() => setIsReady(true)}
      />
    </div>
  );
}
