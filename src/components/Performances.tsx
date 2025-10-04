import type { Performance } from "../types/performances";
import PerformanceItem from "./Performance";
import styles from "./Performances.module.css";

type Props = {
  items: Performance[];
};

export default function Performances({ items }: Props) {
  return (
    <ul className={styles.performances}>
      {items.map((p) => (
        <li><PerformanceItem key={p.id} performance={p} /></li>
      ))}
    </ul>
  );
}
