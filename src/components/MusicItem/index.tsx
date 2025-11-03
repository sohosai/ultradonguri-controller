import clsx from "clsx";

import styles from "./index.module.css";

import type { Music } from "../../types/performances";

type Props = {
  music: Music;
  isPlaying?: boolean;
  isNext?: boolean;
  i: number;
};

export default function MusicItem({ music, isPlaying = false, isNext = false ,i}: Props) {
  const className = clsx(styles.music, {
    [styles.playing]: isPlaying,
    [styles.next]: isNext,
  });

  return (
    <div className={className}>
      <div className={styles.should_be_muted}>
        配信
        <br />
        {music.should_be_muted ? "✕" : "○"}
      </div>
      <div>{i}</div>
      <div className={styles.music_info}>
        <div className={styles.title}>{music.title}</div>
        <div className={styles.artist}>{music.artist}</div>
      </div>
    </div>
  );
}
