import clsx from "clsx";

import styles from "./index.module.css";

import { useState } from "react";

import { sendConversionCmMode } from "../../services/performanceService";
import Toggle from "../Toggle";

type Props = {

  isPlaying?: boolean;
  isNext?: boolean;

  isCmMode?: boolean;
  onCmModeChange?: (isCmMode: boolean) => void;

};


export default function ConversionToggleItem({ isPlaying = false, isNext = false, isCmMode, onCmModeChange }: Props) {
  const className = clsx(styles.conversionToggleItem, {
    [styles.playing]: isPlaying,
    [styles.next]: isNext,
  });

  // -----------------------
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleCmModeToggle = async (checked: boolean) => {
  //   if (isSubmitting) return;

  //   setIsSubmitting(true);
  //   try {
  //     await sendConversionCmMode(checked);
  //     onCmModeChange(checked);
  //   } catch (error) {
  //     console.error("[ConversionMenu] Failed to toggle CM mode:", error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  // -----------------------

  return (
    <div className={className}>
        <div>ー 転換 ー</div>
        <div>CM</div>
        {/* <Toggle checked={isCmMode} onChange={handleCmModeToggle} /> */}
        <Toggle checked={true} onChange={()=>true}></Toggle>
    </div>
  );
}
