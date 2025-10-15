import Toggle from "../Toggle";

import styles from "./index.module.css";

type Props = {
  isCopyrightVisible: boolean;
  onChange: (checked: boolean) => void;
};

export default function CopyrightToggle({ isCopyrightVisible, onChange }: Props) {
  return (
    <div className={styles.copyright}>
      <div className={styles.copyrightTitle}>著作権表示</div>
      <div className={styles.ToggleTextOff}>OFF</div>
      <div className={styles.toggleButton}>
        <Toggle checked={isCopyrightVisible} onChange={onChange} />
      </div>
      <div className={styles.ToggleTextOn}>ON</div>
    </div>
  );
}
