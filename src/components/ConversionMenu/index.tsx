import styles from "./index.module.css";

export default function ConversionMenu() {
  return (
    <div className={styles.conversionMenu}>
      <h2 className={styles.title}>Conversion</h2>
      <div className={styles.info}>
        <p>CM ON/OFF</p>
      </div>
    </div>
  );
}
