import styles from "./index.module.css";

type Props = {
  onPlay: () => void;
  onStop: () => void;
  canPlay: boolean;
  isPlaying: boolean;
  playingFilename: string | null;
};

export default function ConversionBuraritabiButtons({
  onPlay,
  onStop,
  canPlay,
  isPlaying,
  playingFilename,
}: Props) {
  return (
    <div className={styles.play_stopButtons}>
      {isPlaying && playingFilename && (
        <span className={styles.playingLabel}>再生中: {playingFilename}</span>
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
