import ForceMute from "../ForceMute";
import CopyrightToggle from "../CopyrightToggle";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

type Props = {
  isCopyrightVisible: boolean;
  onCopyrightVisibleChange?: (v: boolean) => void;
  onNext?: () => void;
};

export default function Buttons({ isCopyrightVisible, onCopyrightVisibleChange, onNext }: Props) {
  return (
    <div className={styles.buttons}>
      <ForceMute />
      <CopyrightToggle isCopyrightVisible={isCopyrightVisible} onChange={onCopyrightVisibleChange}/>
      <NextTrackButton onNext={onNext} />
    </div>
  );
}
