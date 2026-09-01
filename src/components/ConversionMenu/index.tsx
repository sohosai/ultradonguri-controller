import { useState } from "react";

import { sendConversionCmMode } from "../../services/performanceService";
import ConversionToggleItem from "../ConversionToggleItem";

import styles from "./index.module.css";

import type { TrackRef } from "../../types/tracks";

type Props = {
  isCmMode: boolean;
  onCmModeChange: (isCmMode: boolean) => void;
  conversionId: string;
  currentTrack?: TrackRef | null;
  nextTrack?: TrackRef | null;
  onSelectNextTrack?: (ref: TrackRef) => void;
};

export default function ConversionMenu({
  isCmMode,
  onCmModeChange,
  conversionId,
  currentTrack,
  nextTrack,
  onSelectNextTrack,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCmModeToggle = async (checked: boolean) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendConversionCmMode(checked);
      onCmModeChange(checked);
    } catch (error) {
      console.error("[ConversionMenu] Failed to toggle CM mode:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPlaying = (conversionId: string) =>
    currentTrack?.type === "conversion" && currentTrack?.conversionId === conversionId;

  const isNext = (conversionId: string) => nextTrack?.type === "conversion" && nextTrack?.conversionId === conversionId;

  // ConversionToggleItem の isPlying, isNext は機能実装後に書き換える
  return (
    <div
      className={styles.conversionMenu}
      onClick={() => onSelectNextTrack && onSelectNextTrack({ type: "conversion", conversionId: conversionId })}>
      <ConversionToggleItem
        isPlaying={isPlaying(conversionId)}
        isNext={isNext(conversionId)}
        isCmMode={isCmMode}
        onChange={handleCmModeToggle}
      />
    </div>
  );
}
