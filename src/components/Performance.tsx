import type { Performance } from "../types/performances";

type Props = {
  performance: Performance;
};

export default function PerformanceItem({ performance }: Props) {
  return (
    <div>{performance.title}</div>
  );
}
