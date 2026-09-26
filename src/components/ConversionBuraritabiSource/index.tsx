import { useState, useRef, useEffect } from "react";

import TrashCanIcon from "../../assets/icons/trash_can.svg";
import UploadIcon from "../../assets/icons/upload.svg";

import styles from "./index.module.css";

import type { BurariVideo } from "../../api/http/burariVideos";

interface VideoStats {
  playCount: number;
  lastPlayedAt: string;
}

function timeAgo(isoString: string | undefined): string {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);

  return `${days}日前`;
}

type Props = {
  videos: BurariVideo[];
  selectedFilename: string | null;
  onSelect: (filename: string) => void;
  onUploadClick: () => void;
  onDelete: (filename: string) => void;
  isUploading: boolean;
  canControl: boolean;
  isLoading: boolean;
  stats: Record<string, VideoStats>;
};

export default function ConversionBuraritabiSource({
  videos,
  selectedFilename,
  onSelect,
  onUploadClick,
  onDelete,
  isUploading,
  canControl,
  isLoading,
  stats,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVideo = videos.find((v) => v.filename === selectedFilename);

  return (
    <div className={styles.sourceTable}>
      <div className={styles.sourceChoice} ref={dropdownRef}>
        <div className={styles.selectTrigger} onClick={() => canControl && setIsOpen((v) => !v)}>
          <p>{selectedVideo ? selectedVideo.filename : "動画を選択"}</p>
          <span>▼</span>
        </div>
        {isOpen && (
          <div className={styles.dropdown}>
            {isLoading ? (
              <div className={styles.dropdownItem}>読み込み中...</div>
            ) : videos.length === 0 ? (
              <div className={styles.dropdownItem}>動画がありません</div>
            ) : (
              videos.map((video) => {
                const isSelected = selectedFilename === video.filename;
                const videoStats = stats[video.filename];

                return (
                  <div
                    key={video.filename}
                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemSelected : ""}`}
                    onClick={() => {
                      onSelect(video.filename);
                      setIsOpen(false);
                    }}
                  >
                    <div className={styles.dropdownContent}>
                      <span className={styles.dropdownFilename}>{video.filename}</span>
                      <span className={styles.dropdownAgo}>
                        {videoStats ? timeAgo(videoStats.lastPlayedAt) : ""}
                      </span>
                      <div className={styles.dropdownStatsColumn}>
                        {videoStats ? (
                          <>
                            <span className={styles.dropdownCount}>{videoStats.playCount}回</span>
                            <span className={styles.dropdownLabel}>配信</span>
                          </>
                        ) : (
                          <span className={styles.dropdownEmpty}>未配信</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={styles.dropdownDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canControl) onDelete(video.filename);
                      }}
                      disabled={!canControl}
                    >
                      <img src={TrashCanIcon} alt="削除" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <div className={styles.sourceImage} onClick={onUploadClick}>
        <img src={UploadIcon} alt="アップロード" />
      </div>
      {isUploading && <span className={styles.uploadingText}>アップロード中...</span>}
    </div>
  );
}
