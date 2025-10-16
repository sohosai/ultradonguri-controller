import styles from "./index.module.css";

import type { Conversion } from "../../types/performances";

type Props = {
  conversion: Conversion;
  isSelected?: boolean;
  onSelect?: (conversion: Conversion) => void;
};

export default function ConversionItem({ conversion, isSelected, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(conversion);
  };

  return (
    <div className={styles.conversion} data-selected={isSelected} onClick={handleClick}>
      <div className={styles.title}>{conversion.title}</div>
    </div>
  );
}
