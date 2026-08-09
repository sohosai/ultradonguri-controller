import CopyrightToggle from "../CopyrightToggle";
import ForceMute from "../ForceMute";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

type Props = {
  isCopyrightVisible: boolean;
  onCopyrightVisibleChange: (v: boolean) => void;
  onNext?: () => void;
  isForceMuted: boolean;
  onForceMuteChange: (isMuted: boolean) => void;
  onError?: (errorMessage: string) => void;
  isCmMode?: boolean;
  isConversion?: boolean;
  isUnmuteConfirmOpen?: boolean;
  onUnmuteConfirmClose?: () => void;
};

export default function Buttons({
  isCopyrightVisible,
  onCopyrightVisibleChange,
  onNext,
  isForceMuted,
  onForceMuteChange,
  onError,
  isCmMode,
  isConversion,
  isUnmuteConfirmOpen,
  onUnmuteConfirmClose,
}: Props) {
  return (
    <div className={styles.buttons}>
      <ForceMute
        isForceMuted={isForceMuted}
        onForceMuteChange={onForceMuteChange}
        onError={onError}
        isCmMode={isCmMode}
        isConversion={isConversion}
        isUnmuteConfirmOpen={isUnmuteConfirmOpen}
        onUnmuteConfirmClose={onUnmuteConfirmClose}
      />
      <CopyrightToggle isCopyrightVisible={isCopyrightVisible} onChange={onCopyrightVisibleChange} />
      <NextTrackButton onNext={onNext} />
    </div>
  );
}
