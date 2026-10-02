import clsx from "clsx";

import isConversion from "../Buttons/index.tsx";
import Toggle from "../Toggle";

import styles from "./index.module.css";

type Props = {
  isCmMode: boolean;

  isPlaying?: boolean;
  isNext?: boolean;
  disabled?: boolean;
  onChange: (isCmMode: boolean) => void;
};

export default function ConversionToggleItem({
  disabled = false,
  isPlaying = false,
  isNext = false,
  isCmMode,
  onChange,
}: Props) {
  const className = clsx(styles.conversionToggleItem, {
    [styles.playing]: isPlaying,
    [styles.next]: isNext,
  });

  return (
    <div className={className}>
      <div className={styles.info}>
        <p className={styles.conversion}>転換</p>
        <div className={styles.CMandToggle}>
          <p>CM</p>
          <div className={styles.toggle} onClick={(event) => event.stopPropagation()}>
            <Toggle checked={isCmMode} onChange={onChange} disabled={!isConversion && disabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
