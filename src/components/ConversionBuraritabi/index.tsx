import { useEffect, useState, useRef, useCallback } from "react";

import { getBurariVideos, uploadBurariVideo, deleteBurariVideo } from "../../api/http/burariVideos";
import { streamClient } from "../../api/ws/streamClient";
import ConversionBuraritabiButtons from "../ConversionBuraritabiButtons";
import ConversionBuraritabiPreview from "../ConversionBuraritabiPreview";
import ConversionBuraritabiSource from "../ConversionBuraritabiSource";

import styles from "./index.module.css";

import type { BurariVideo } from "../../api/http/burariVideos";

const STATS_STORAGE_KEY = "donguri_burari_stats";
const SELECTED_KEY = "donguri_burari_selected";

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

  return `${stats.playCount}回・${timeAgo(stats.lastPlayedAt)}`;
}

type Props = {
  isCmMode: boolean;
  isForceMuted: boolean;
  isConversion: boolean;
  isPlaying: boolean;
  playingFilename: string | null;
};

export default function ConversionBuraritabi({
  isCmMode,
  isForceMuted: _isForceMuted,
  isConversion,
  isPlaying,
  playingFilename,
}: Props) {
  const [videos, setVideos] = useState<BurariVideo[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(
    () => localStorage.getItem(SELECTED_KEY),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<Record<string, VideoStats>>(() => loadStats());
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);

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
    if (!selectedFilename || videos.length === 0) return;
    if (!videos.find((v) => v.filename === selectedFilename)) {
      setSelectedFilename(null);
    }
  }, [videos, selectedFilename]);

  useEffect(() => {
    if (selectedFilename) {
      localStorage.setItem(SELECTED_KEY, selectedFilename);
    } else {
      localStorage.removeItem(SELECTED_KEY);
    }
  }, [selectedFilename]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamClient.send("/burari/stop", {});
  }, []);

  const handlePlay = useCallback(() => {
    if (!selectedFilename) return;
    recordPlay(selectedFilename);
    setStats(loadStats());
    streamClient.send("/burari/play", { filename: selectedFilename });

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = `/burari/videos/${encodeURIComponent(selectedFilename)}`;
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        streamClient.send("/burari/stop", {});
      }, (duration + 5) * 1000);
    };
    video.onerror = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        streamClient.send("/burari/stop", {});
      }, 5 * 60 * 1000);
    };
  }, [selectedFilename]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`${filename} を削除しますか？`)) return;
    try {
      await deleteBurariVideo(filename);
      if (selectedFilename === filename) setSelectedFilename(null);
      await fetchVideos();
    } catch {
      setError("削除に失敗しました");
    }
  };

  const canControl = isConversion && !isCmMode && !isPlaying;
  const canPlay = canControl && !!selectedFilename;

  return (
    <div className={styles.conversionBuraritabi}>
      <div className={styles.info}>
        <p className={styles.buraritabi}>ぶらり旅</p>
        {error && (
          <div className={styles.error}>
            <span>{error}</span>
            <button className={styles.errorClose} onClick={() => setError(null)} aria-label="閉じる">
              ✕
            </button>
          </div>
        )}
        <div className={styles.source}>
          <p>ソース</p>
          <ConversionBuraritabiSource
            videos={videos}
            selectedFilename={selectedFilename}
            onSelect={(fn) => canControl && setSelectedFilename(fn)}
            onUploadClick={handleUploadClick}
            onDelete={handleDelete}
            isUploading={isUploading}
            canControl={canControl}
            isLoading={isLoading}
            stats={stats}
            formatStats={formatStats}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        <div className={styles.preview}>
          <p>プレビュー</p>
          <ConversionBuraritabiPreview
            selectedFilename={selectedFilename}
            isPreviewEnabled={isPreviewEnabled}
            onTogglePreview={() => setIsPreviewEnabled((v) => !v)}
          />
        </div>
        <div className={styles.start_stop}>
          <ConversionBuraritabiButtons
            onPlay={handlePlay}
            onStop={handleStop}
            canPlay={canPlay}
            isPlaying={isPlaying}
            playingFilename={playingFilename}
          />
        </div>
      </div>
      {/* {isPlaying && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p className={styles.playingTitle}>再生中: {playingFilename}</p>
            <button className={styles.modalStopButton} onClick={handleStop}>
              再生停止
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}
