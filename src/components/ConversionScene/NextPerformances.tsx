import type { NextPerformance } from "../../types/performances";

type ConversionSceneProps = {
  nextPerformances: NextPerformance[];
};

export default function NextPerformances({ nextPerformances }: ConversionSceneProps) {
  return (
    <div>
      <div>
        {nextPerformances.slice(0, 3).map((performance, index) => (
          <div key={index}>
            <div>{performance.title}</div>
            <div>{performance.performer}</div>
            <div>{performance.starts_at}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
