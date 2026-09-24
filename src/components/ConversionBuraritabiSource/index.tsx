import { useState, useRef, useEffect } from "react";

import UploadIcon from "../../assets/icons/upload.svg";

import styles from "./index.module.css";

import type { BurariVideo } from "../../api/http/burariVideos";

interface VideoStats {
  playCount: number;
  lastPlayedAt: string;
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
  formatStats: (stats?: VideoStats) => string;
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
  formatStats,
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
              videos.map((video) => (
                <div
                  key={video.filename}
                  className={`${styles.dropdownItem} ${selectedFilename === video.filename ? styles.dropdownItemSelected : ""}`}
                  onClick={() => {
                    onSelect(video.filename);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.dropdownFilename}>{video.filename}</span>
                  <span className={styles.dropdownStats}>{formatStats(stats[video.filename])}</span>
                  <button
                    className={styles.dropdownDelete}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canControl) onDelete(video.filename);
                    }}
                    disabled={!canControl}
                  >
                    削除
                  </button>
                </div>
              ))
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
