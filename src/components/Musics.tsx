import type { Music } from "../types/performances";
import MusicItem from "./MusicItem";
import styles from "./Performances.module.css";

type Props = {
  items: Music[];
};

export default function Music({ items }: Props) {
  return (
    <ul className={styles.performances}>
      {items.map((m) => (
        <li><MusicItem key={m.id} music={m} /></li>
      ))}
    </ul>
  );
}
