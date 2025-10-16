import ForceMute from "../ForceMute";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

type Props = {
  onNext?: () => void;
  isForceMuted: boolean;
  onForceMuteChange: (isMuted: boolean) => void;
};

export default function Buttons({ onNext, isForceMuted, onForceMuteChange }: Props) {
  return (
    <div className={styles.buttons}>
      <ForceMute isForceMuted={isForceMuted} onForceMuteChange={onForceMuteChange} />
      <NextTrackButton onNext={onNext} />
    </div>
  );
}
