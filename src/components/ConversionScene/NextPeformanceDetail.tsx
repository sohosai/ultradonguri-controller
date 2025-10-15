import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

export default function NextPerformanceDetail({ nextPerformances }: ConversionSceneProps) {
  const performance = nextPerformances[0];

  return (
    <div>
      <div>{performance.title}</div>
      <div>{performance.performer}</div>
      <div>{performance.starts_at}</div>
    </div>
  );
}
