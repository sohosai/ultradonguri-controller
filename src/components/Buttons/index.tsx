import ForceMute from "../ForceMute";
import NextTrackButton from "../NextTrackButton";

import styles from "./index.module.css";

export default function Buttons() {
  return (
    <div className={styles.buttons}>
      ここにボタン
      <ForceMute />
      <NextTrackButton />
    </div>
  );
}
