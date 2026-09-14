import { useEffect, useState, useRef, useCallback } from "react";

import { getBurariVideos, uploadBurariVideo, deleteBurariVideo, burariVideoUrl } from "../../api/http/burariVideos";
import { streamClient } from "../../api/ws/streamClient";

import styles from "./Burari.module.css";

import type { BurariVideo } from "../../api/http/burariVideos";

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
      <div className={styles.videoList}>
        {isLoading ? (
          <div className={styles.empty}>読み込み中...</div>
        ) : videos.length === 0 ? (
          <div className={styles.empty}>videos/ フォルダに mp4 を配置してください</div>
        ) : (
          videos.map((video) => (
            <div
              key={video.filename}
              className={`${styles.videoItem} ${selectedFilename === video.filename ? styles.selected : ""}`}
              onClick={() => canControl && setSelectedFilename(video.filename)}
            >
              <span className={styles.filename}>{video.filename}</span>
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
