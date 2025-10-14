import { getConversion } from "../../data/conversions";
import ConversionItem from "../ConversionItem";
import PerformanceItem from "../PerformanceItem";

import styles from "./index.module.css";

import type { Conversion, Performance } from "../../types/performances";

type Props = {
  items: Performance[];
  selectedPerformance?: Performance | null;
  selectedConversion?: Conversion | null;
  onSelectPerformance?: (performance: Performance) => void;
  onSelectConversion?: (conversion: Conversion) => void;
};

export default function Performances({
  items,
  selectedPerformance,
  selectedConversion,
  onSelectPerformance,
  onSelectConversion,
}: Props) {
  const renderItems = () => {
    const elements: React.JSX.Element[] = [];

    items.forEach((performance, index) => {
      elements.push(
        <li key={performance.id}>
          <PerformanceItem
            performance={performance}
            isSelected={selectedPerformance?.id === performance.id}
            onSelect={onSelectPerformance}
          />
        </li>
      );

      const conversion = getConversion(index);
      elements.push(
        <li key={conversion.id}>
          <ConversionItem
            conversion={conversion}
            isSelected={selectedConversion?.id === conversion.id}
            onSelect={onSelectConversion}
          />
        </li>
      );
    });

    return elements;
  };

  return <ul className={styles.performances}>{renderItems()}</ul>;
}
