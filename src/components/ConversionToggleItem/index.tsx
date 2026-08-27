import clsx from "clsx";

import Toggle from "../Toggle";

import styles from "./index.module.css";

type Props = {

  isPlaying?: boolean;
  isNext?: boolean;

  isCmMode: boolean;

  onChange: (isCmMode: boolean) => void;
  
};


export default function ConversionToggleItem({ isPlaying = false, isNext = false, isCmMode, onChange }: Props) {
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
            <div className={styles.toggle}>
              <Toggle checked={isCmMode} onChange={onChange} />
            </div>
          </div>
        </div>
    </div>
  );
}
