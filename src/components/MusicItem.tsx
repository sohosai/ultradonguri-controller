import type { Music } from "../types/performances";
import styles from "./Performance.module.css";

type Props = {
  music: Music;
};

export default function MusicItem({ music }: Props) {
  return (
    <div className={styles.performance}>
      <div className={styles.title}>{music.title}</div>
    </div>
  );
}
