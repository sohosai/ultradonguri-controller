import styles from "./index.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li className={styles.logo}>Ultradonguri</li>
        <li>
          <ul>
            <li>5min押し</li>
            <li>12:34</li>
          </ul>
        </li>
      </ul>
    </header>
  );
}
