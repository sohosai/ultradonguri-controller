import styles from "./index.module.css";

type Props = {
  isForceMuted: boolean;
};

export default function Header({ isForceMuted }: Props) {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>
          <ul>
            <li>12:34</li>
            <li>5min押し</li>
          </ul>
        </li>
        <li className={styles.logo}>Ultradonguri</li>
        <li className={styles.forceMute}>{isForceMuted && "強制ミュート中"}</li>
      </ul>
    </header>
  );
}
