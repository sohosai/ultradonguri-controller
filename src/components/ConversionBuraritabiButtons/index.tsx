import styles from "./index.module.css";

type Props = {
  onPlay: () => void;
  onStop: () => void;
  canPlay: boolean;
  isPlaying: boolean;
  playingFilename: string | null;
  selectedFilename: string | null;
  isConversionPlaying: boolean;
};

export default function ConversionBuraritabiButtons({
  onPlay,
  onStop,
  canPlay,
  isPlaying,
  playingFilename,
  selectedFilename,
  isConversionPlaying,
}: Props) {
  const showCannotPlay = selectedFilename && !isConversionPlaying && !isPlaying;

  return (
    <div className={styles.play_stopButtons}>
      {isPlaying && playingFilename && (
        <span className={styles.playingLabel}>再生中: {playingFilename}</span>
      )}
      {showCannotPlay && (
        <span className={styles.cannotPlayLabel}>転換が選択されていないため再生不可</span>
      )}
      <button className={styles.playButton} onClick={onPlay} disabled={!canPlay}>
        再生
      </button>
      <button className={styles.stopButton} onClick={onStop} disabled={!isPlaying}>
        停止
      </button>
    </div>
  );
}
