import styles from './Header.module.css';

export default function Header(){
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>12:34</li>
        <li>5min押し</li>
      </ul>
    </header>
  );
}