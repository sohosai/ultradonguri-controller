import clsx from "clsx";

import styles from "./index.module.css";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function MuteToggle({ checked, onChange, disabled = false }: Props) {
  return (
    <div className={clsx(styles.toggleRow, disabled && styles.disabled)}>
      <div className={styles.toggleText}>OFF</div>

      <div className={styles.toggleButton}>
        <label className={styles.switch}>
          <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
          <span className={styles.slider} aria-hidden="true" />
        </label>
      </div>

      <div className={styles.toggleText}>ON</div>
    </div>
  );
}
