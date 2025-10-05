import MusicItem from "./MusicItem";
import styles from "./Musics.module.css";

import type { Music } from "../types/performances";

type Props = {
  items: Music[];
};

export default function Music({ items }: Props) {
  return (
    <ul className={styles.musics}>
      {items.map((m) => (
        <li>
          <MusicItem key={m.id} music={m} />
        </li>
      ))}
    </ul>
  );
}
