import PerformanceItem from "../PerformanceItem";
import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type Props = {
  items: Performance[];
  onSelect?: (performance: Performance) => void;
};

export default function Performances({ items, onSelect }: Props) {
  return (
    <ul className={styles.performances}>
      {items.map((p) => (
        <li key={p.id}>
          <PerformanceItem performance={p} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

