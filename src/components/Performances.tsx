import type { Performance } from "../types/performances";
import PerformanceItem from "./Performance";

type Props = {
  items: Performance[];
};

export default function Performances({ items }: Props) {
  return (
    <ul>
      {items.map((p) => (
        <li><PerformanceItem key={p.id} performance={p} /></li>
      ))}
    </ul>
  );
}
