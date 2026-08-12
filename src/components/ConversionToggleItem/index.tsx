import clsx from "clsx";

import styles from "./index.module.css";

import { useState } from "react";

import { sendConversionCmMode } from "../../services/performanceService";
import Toggle from "../Toggle";

type Props = {

  isPlaying?: boolean;
  isNext?: boolean;

  isCmMode: boolean;
  // onCmModeChange: (isCmMode: boolean) => void;

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
            <Toggle checked={isCmMode} onChange={onChange} />
          </div>
        </div>
        {/* <Toggle checked={true} onChange={()=>true}></Toggle> */}
    </div>
  );
}
