import styles from "./index.module.css";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

export default function Toggle({ checked, onChange }: Props) {
  return (
    <label className={styles.switch}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.slider} aria-hidden="true" />
    </label>
  );
}
