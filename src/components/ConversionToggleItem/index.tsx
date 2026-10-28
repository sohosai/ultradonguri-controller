import clsx from "clsx";

import Toggle from "../Toggle";

import styles from "./index.module.css";

type Props = {
  isCmMode: boolean;

  isPlaying?: boolean;
  isNext?: boolean;
  isBurariPlaying?: boolean;
  onChange: (isCmMode: boolean) => void;
};

export default function ConversionToggleItem({
  isPlaying = false,
  isNext = false,
  isBurariPlaying = false,
  isCmMode,
  onChange,
}: Props) {
  const className = clsx(styles.conversionToggleItem, {
    [styles.playing]: isPlaying,
    [styles.next]: isNext,
  });
  const isCmToggleDisabled = !isPlaying || isBurariPlaying;

  return (
    <div className={className}>
      <div className={styles.info}>
        <p className={styles.conversion}>転換</p>
        <div
          className={clsx(styles.CMandToggle, isCmToggleDisabled && styles.cmDisabled)}
          title={isBurariPlaying ? "ぶらり旅再生中はCMに切り替えられません" : undefined}>
          <p className={isCmToggleDisabled ? styles.disabled : styles.enabled}>CM</p>
          <div className={styles.toggle} onClick={(event) => event.stopPropagation()}>
            <Toggle checked={isCmMode} onChange={onChange} disabled={isCmToggleDisabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
