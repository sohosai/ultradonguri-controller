import clsx from "clsx";

import styles from "./index.module.css";

import type { Music } from "../../types/performances";
import type { Status } from "../../types/status";

type Props = {
  music: Music;
  status?: Status;
};

export default function MusicItem({ music, status = "default" }: Props) {
  const className = clsx(styles.music, {
    [styles.playing]: status === "playing",
    [styles.queued]: status === "queued",
  });

  return (
    <div className={className}>
      <div className={styles.title}>{music.title}</div>
    </div>
  );
}
