import styles from "./index.module.css";

export default function ForceMute() {
  return (
    <div className={styles.tigerStripe}>
        <div className={styles.forceMute}>
              強制
              <br />
             ミュート
           <div className={styles.glass}></div>
      </div>
    </div>
  );
}
