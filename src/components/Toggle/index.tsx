import styles from "./index.module.css";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function Toggle({ checked, onChange, disabled = false }: Props) {
  return (
    <div className={`${styles.toggleRow} ${disabled ? styles.disabled : ""}`}>
      <div className={styles.toggleText}>OFF</div>

      <div className={styles.toggleButton}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span className={`${styles.slider} ${disabled ? styles.sliderDisabled : ""}`} aria-hidden="true" />
        </label>
      </div>

      <div className={styles.toggleText}>ON</div>
    </div>
  );
}
