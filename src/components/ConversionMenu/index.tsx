import styles from "./index.module.css";

import type { Conversion } from "../../types/performances";

type Props = {
  conversion: Conversion;
};

export default function ConversionMenu({ conversion }: Props) {
  return (
    <div className={styles.conversionMenu}>
      <h2 className={styles.title}>{conversion.title}</h2>
      {conversion.description && <p className={styles.description}>{conversion.description}</p>}
      <div className={styles.info}>
        <p>転換中...</p>
      </div>
    </div>
  );
}
