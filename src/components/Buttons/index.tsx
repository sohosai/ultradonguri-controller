import CopyrightToggle from "../CopyrightToggle";
import MuteControl from "../MuteControl";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

type Props = {
  isCopyrightVisible: boolean;
  onCopyrightVisibleChange: (v: boolean) => void;
  onNext?: () => void;
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
  onError?: (errorMessage: string) => void;
  isCmMode?: boolean;
  isConversion?: boolean;
};

export default function Buttons({
  isCopyrightVisible,
  onCopyrightVisibleChange,
  onNext,
  isMuted,
  onMuteChange,
  onError,
  isCmMode,
  isConversion,
}: Props) {
  return (
    <div className={styles.buttons}>
      <MuteControl
        isMuted={isMuted}
        onMuteChange={onMuteChange}
        onError={onError}
        isCmMode={isCmMode}
        isConversion={isConversion}
      />
      <CopyrightToggle isCopyrightVisible={isCopyrightVisible} onChange={onCopyrightVisibleChange} />
      <NextTrackButton onNext={onNext} />
    </div>
  );
}
