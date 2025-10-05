import styles from "./index.module.css";

import type { Music } from "../../types/performances";

type Props = {
  music: Music;
};

export default function MusicItem({ music }: Props) {
  return (
    <div className={styles.music}>
      <div className={styles.title}>{music.title}</div>
    </div>
  );
}

