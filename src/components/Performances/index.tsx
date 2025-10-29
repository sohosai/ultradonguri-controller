import { getConversion } from "../../data/conversions";
import ConversionItem from "../ConversionItem";
import PerformanceItem from "../PerformanceItem";

import styles from "./index.module.css";

import type { Conversion, Performance } from "../../types/performances";
import type { TrackRef } from "../../types/tracks";

type Props = {
  items: Performance[];
  selectedPerformance?: Performance | null;
  selectedConversion?: Conversion | null;
  currentTrack?: TrackRef | null;
  onSelectPerformance?: (performance: Performance) => void;
  onSelectConversion?: (conversion: Conversion) => void;
};

export default function Performances({
  items,
  selectedPerformance,
  selectedConversion,
  currentTrack,
  onSelectPerformance,
  onSelectConversion,
}: Props) {
  const renderItems = () => {
    const elements: React.JSX.Element[] = [];

    items.forEach((performance, index) => {
      const isPerformancePlaying = currentTrack?.type === "music" && currentTrack.performanceId === performance.id;

      elements.push(
        <li key={performance.id}>
          <PerformanceItem
            performance={performance}
            isSelected={selectedPerformance?.id === performance.id}
            isPlaying={isPerformancePlaying}
            onSelect={onSelectPerformance}
          />
        </li>
      );

      // 最後のパフォーマンスの後には転換を追加しない
      if (index < items.length - 1) {
        const conversion = getConversion(index);
        const isConversionPlaying = currentTrack?.type === "conversion" && currentTrack.conversionId === conversion.id;

        elements.push(
          <li key={conversion.id}>
            <ConversionItem
              conversion={conversion}
              isSelected={selectedConversion?.id === conversion.id}
              isPlaying={isConversionPlaying}
              onSelect={onSelectConversion}
            />
          </li>
        );
      }
    });

    return elements;
  };

  return <ul className={styles.performances}>{renderItems()}</ul>;
}
