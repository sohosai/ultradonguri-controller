import Clock from "./clock.tsx";
import styles from "./index.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li className={styles.logo}>Ultradonguri</li>
        <li>
          <ul>
            <li>5min押し</li>
            <li>
              <Clock />
            </li>
          </ul>
        </li>
      </ul>
    </header>
  );
}
