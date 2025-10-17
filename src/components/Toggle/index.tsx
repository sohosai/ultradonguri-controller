import styles from "./index.module.css";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({ checked, onChange }: Props) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>OFF</div>

      <div className={styles.toggleButton}>
        <label className={styles.switch}>
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <span className={styles.slider} aria-hidden="true" />
        </label>
      </div>

      <div className={styles.toggleText}>ON</div>
    </div>
  );
}
