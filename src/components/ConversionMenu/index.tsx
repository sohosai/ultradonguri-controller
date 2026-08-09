import { useState } from "react";

import { sendConversionCmMode } from "../../services/performanceService";
import Toggle from "../Toggle";
import ConversionToggleItem from "../ConversionToggleItem";

import styles from "./index.module.css";

type Props = {
  isCmMode: boolean;
  onCmModeChange: (isCmMode: boolean) => void;
};

export default function ConversionMenu({ isCmMode, onCmModeChange }: Props) {
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

  return (
    <div className={styles.conversionMenu}>
      <h2 className={styles.title}>Conversion</h2>
      <ConversionToggleItem isPlaying={false} isNext={false} isCmMode={isCmMode} onChange={handleCmModeToggle}/>
      <div className={styles.info}>
        <p>CM</p>
        <Toggle checked={isCmMode} onChange={handleCmModeToggle} />
      </div>
    </div>
  );
}
