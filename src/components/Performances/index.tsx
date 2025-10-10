import PerformanceItem from "../PerformanceItem";

import styles from "./index.module.css";

import type { Performance } from "../../types/performances";

type Props = {
  items: Performance[];
  selectedPerformance?: Performance | null;
  onSelect?: (performance: Performance) => void;
};

export default function Performances({ items, selectedPerformance, onSelect }: Props) {
  return (
    <ul className={styles.performances}>
      {items.map((p) => (
        <li key={p.id}>
          <PerformanceItem performance={p} isSelected={selectedPerformance?.id === p.id} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
