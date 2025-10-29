import styles from "./index.module.css";

import type { Conversion } from "../../types/performances";

type Props = {
  conversion: Conversion;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: (conversion: Conversion) => void;
};

export default function ConversionItem({ conversion, isSelected, isPlaying, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(conversion);
  };

  return (
    <div className={styles.conversion} data-selected={isSelected} data-playing={isPlaying} onClick={handleClick}>
      <div className={styles.title}>
        {isPlaying && "▶"} {conversion.title}
      </div>
    </div>
  );
}
