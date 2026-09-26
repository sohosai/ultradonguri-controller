import { useEffect, useRef, useState } from "react";

import { burariVideoUrl } from "../../api/http/burariVideos";

import styles from "./index.module.css";

type Props = {
  selectedFilename: string | null;
  isPreviewEnabled: boolean;
  onTogglePreview: () => void;
};

export default function ConversionBuraritabiPreview({
  selectedFilename,
  isPreviewEnabled,
  onTogglePreview,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setCurrentTime(0);
    };
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [selectedFilename]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedFilename) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  }, [selectedFilename]);

  if (!isPreviewEnabled) {
    return (
      <div className={styles.preview}>
        {!selectedFilename ? (
          <p className={styles.empty}>動画を選択してください</p>
        ) : (
          <div className={styles.hiddenPanel}>
            <span>非表示です。</span>
            <button className={styles.toggleButton} onClick={onTogglePreview}>
              表示
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!selectedFilename) {
    return (
      <div className={styles.preview}>
        <p className={styles.empty}>動画を選択してください</p>
      </div>
    );
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);

    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const t = Number(e.target.value);
    video.currentTime = t;
    setCurrentTime(t);
  };

  return (
    <div className={styles.preview}>
      <video
        ref={videoRef}
        src={burariVideoUrl(selectedFilename)}
        className={styles.video}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        onClick={togglePlay}
      />
      <div className={styles.controls}>
        <button className={styles.playButton} onClick={togglePlay}>
          {isPlaying ? "⏸ 一時停止" : "▶ 再生"}
        </button>
        <span className={styles.time}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          className={styles.seekbar}
          onMouseDown={() => {
            isSeekingRef.current = true;
          }}
          onMouseUp={() => {
            isSeekingRef.current = false;
          }}
          onTouchStart={() => {
            isSeekingRef.current = true;
          }}
          onTouchEnd={() => {
            isSeekingRef.current = false;
          }}
          onChange={handleSeek}
        />
        <button className={styles.toggleButton} onClick={onTogglePreview}>
          非表示
        </button>
      </div>
    </div>
  );
}
