import Toggle from "../Toggle";

import styles from "./index.module.css";

export default function ConversionMenu() {
  return (
    <div className={styles.conversionMenu}>
      <h2 className={styles.title}>Conversion</h2>
      <div className={styles.info}>
        <p>CM</p>
        <p>
          <Toggle />
        </p>
      </div>
    </div>
  );
}
