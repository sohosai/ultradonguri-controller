import Clock from "./clock.tsx";
import styles from "./index.module.css";

type Props = {
  isMuted: boolean;
};

export default function Header({ isMuted }: Props) {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>
          <Clock />
        </li>
        <li className={styles.logo}>Ultradonguri</li>
        <li className={styles.mute}>{isMuted && "ミュート中"}</li>
      </ul>
    </header>
  );
}
