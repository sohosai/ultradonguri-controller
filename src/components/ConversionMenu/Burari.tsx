import { useEffect, useState, useRef, useCallback } from "react";

import { getBurariVideos, uploadBurariVideo, deleteBurariVideo, burariVideoUrl } from "../../api/http/burariVideos";
import { streamClient } from "../../api/ws/streamClient";

import styles from "./Burari.module.css";

import type { BurariVideo } from "../../api/http/burariVideos";

const STATS_STORAGE_KEY = "donguri_burari_stats";

interface VideoStats {
  playCount: number;
  lastPlayedAt: string;
}

function loadStats(): Record<string, VideoStats> {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as Record<string, VideoStats>;
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, VideoStats>): void {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

function recordPlay(filename: string): void {
  const stats = loadStats();
  const existing = stats[filename];
  stats[filename] = {
    playCount: (existing?.playCount ?? 0) + 1,
    lastPlayedAt: new Date().toISOString(),
  };
  saveStats(stats);
}

function timeAgo(isoString: string | undefined): string {
  if (!isoString) return "未再生";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);

  return `${days}日前`;
}

function formatStats(stats: VideoStats | undefined): string {
  if (!stats) return "未再生";
  const count = stats.playCount;
  const ago = timeAgo(stats.lastPlayedAt);

  return `${count}回・${ago}`;
}

type Props = {
  isCmMode: boolean;
  isForceMuted: boolean;
  isConversion: boolean;
};

export default function Burari({ isCmMode, isForceMuted, isConversion }: Props) {
  const [videos, setVideos] = useState<BurariVideo[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingFilename, setPlayingFilename] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [stats, setStats] = useState<Record<string, VideoStats>>(() => loadStats());

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getBurariVideos();
      setVideos(list);
    } catch {
      setError("動画一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (selectedFilename && !videos.find((v) => v.filename === selectedFilename)) {
      setSelectedFilename(null);
    }
  }, [videos, selectedFilename]);

  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamClient.send("/burari/stop", {});
    setIsPlaying(false);
    setPlayingFilename(null);
  }, []);

  useEffect(() => {
    const unsub = streamClient.on("/burari/ended", () => {
      handleStop();
    });

    return unsub;
  }, [handleStop]);

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const isSeekingRef = useRef(false);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    const onEnded = () => setIsPreviewPlaying(false);
    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setPreviewCurrentTime(video.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      setPreviewDuration(video.duration);
      setPreviewCurrentTime(0);
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [selectedFilename, isPreviewEnabled]);

  useEffect(() => {
    const video = previewRef.current;
    if (!video || !selectedFilename) return;
    video.pause();
    video.currentTime = 0;
    setIsPreviewPlaying(false);
  }, [selectedFilename]);

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`${filename} を削除しますか？`)) return;
    try {
      await deleteBurariVideo(filename);
      await fetchVideos();
    } catch {
      setError("削除に失敗しました");
    }
  };

  const handlePlay = () => {
    if (!selectedFilename) return;
    recordPlay(selectedFilename);
    setStats(loadStats());
    streamClient.send("/burari/play", { filename: selectedFilename });
    setIsPlaying(true);
    setPlayingFilename(selectedFilename);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = burariVideoUrl(selectedFilename);
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const margin = 5;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleStop();
      }, (duration + margin) * 1000);
    };
    video.onerror = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleStop();
      }, 5 * 60 * 1000);
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      await uploadBurariVideo(file);
      await fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const canControl = isConversion && !isCmMode && !isPlaying;

  return (
    <section className={styles.burari}>
      <h2 className={styles.burariTitle}>ぶらり旅</h2>
      {error && (
        <div className={styles.error}>
          {error}
          <button className={styles.errorClose} onClick={() => setError(null)} aria-label="閉じる">
            ✕
          </button>
        </div>
      )}
      {isForceMuted && (
        <div className={styles.muteWarning}>ミュートONなので、ぶらり旅の音声は再生されません</div>
      )}
      <div className={styles.previewToggleRow}>
        <button
          className={styles.previewToggle}
          onClick={() => setIsPreviewEnabled((v) => !v)}
        >
          {isPreviewEnabled ? "👁️ プレビュー表示中" : "👁️ プレビュー非表示"}
        </button>
      </div>
      {isPreviewEnabled && selectedFilename && (
        <div className={styles.previewArea}>
          <video
            ref={previewRef}
            src={burariVideoUrl(selectedFilename)}
            className={styles.previewVideo}
            muted
            playsInline
            preload="metadata"
            onClick={() => {
              const video = previewRef.current;
              if (!video) return;
              if (video.paused) {
                video.play();
                setIsPreviewPlaying(true);
              } else {
                video.pause();
                setIsPreviewPlaying(false);
              }
            }}
          />
          <div className={styles.previewControls}>
            <button
              className={styles.previewPlayButton}
              onClick={() => {
                const video = previewRef.current;
                if (!video) return;
                if (video.paused) {
                  video.play();
                  setIsPreviewPlaying(true);
                } else {
                  video.pause();
                  setIsPreviewPlaying(false);
                }
              }}
            >
              {isPreviewPlaying ? "⏸ 一時停止" : "▶ 再生"}
            </button>
            <span className={styles.previewTime}>
              {formatTime(previewCurrentTime)} / {formatTime(previewDuration)}
            </span>
            <input
              type="range"
              min={0}
              max={previewDuration || 1}
              step={0.1}
              value={previewCurrentTime}
              className={styles.previewSeekbar}
              onMouseDown={() => { isSeekingRef.current = true; }}
              onMouseUp={() => { isSeekingRef.current = false; }}
              onTouchStart={() => { isSeekingRef.current = true; }}
              onTouchEnd={() => { isSeekingRef.current = false; }}
              onChange={(e) => {
                const video = previewRef.current;
                if (!video) return;
                const newTime = Number(e.target.value);
                video.currentTime = newTime;
                setPreviewCurrentTime(newTime);
              }}
            />
          </div>
        </div>
      )}
      <div className={styles.videoList}>
        {isLoading ? (
          <div className={styles.empty}>読み込み中...</div>
        ) : videos.length === 0 ? (
          <div className={styles.empty}>videos/ フォルダに mp4 を配置するか、アップロードしてください</div>
        ) : (
          videos.map((video) => (
            <div
              key={video.filename}
              className={`${styles.videoItem} ${selectedFilename === video.filename ? styles.selected : ""}`}
              onClick={() => canControl && setSelectedFilename(video.filename)}
            >
              <div className={styles.videoInfo}>
                <span className={styles.filename}>{video.filename}</span>
                <span className={styles.stats}>{formatStats(stats[video.filename])}</span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canControl) void handleDelete(video.filename);
                }}
                disabled={!canControl}
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
      <div className={styles.buttons}>
        <button
          className={styles.uploadButton}
          onClick={handleUploadClick}
          disabled={!canControl || isUploading}
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className={styles.playButton}
          onClick={handlePlay}
          disabled={!canControl || !selectedFilename}
        >
          再生
        </button>
      </div>

      {isPlaying && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p className={styles.playingTitle}>再生中: {playingFilename}</p>
            <button className={styles.stopButton} onClick={handleStop}>
              再生停止
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
