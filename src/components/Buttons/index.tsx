import ForceMute from "../ForceMute";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

type Props = {
  onNext?: () => void;
};

export default function Buttons({ onNext }: Props) {
  return (
    <div className={styles.buttons}>
      ここにボタン
      <ForceMute />
      <NextTrackButton onNext={onNext} />
    </div>
  );
}
