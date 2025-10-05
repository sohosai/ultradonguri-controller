import MusicItem from "../MusicItem";

import styles from "./index.module.css";

import type { Music } from "../../types/performances";

type Props = {
  items: Music[];
};

export default function Music({ items }: Props) {
  return (
    <ul className={styles.musics}>
      {items.map((m) => (
        <li key={m.id}>
          <MusicItem music={m} />
        </li>
      ))}
    </ul>
  );
}
