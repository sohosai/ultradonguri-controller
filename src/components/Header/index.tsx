import Clock from "./clock.tsx";
import styles from "./index.module.css";

type Props = {
  isForceMuted: boolean;
  isBurariPlaying?: boolean;
};

export default function Header({ isForceMuted, isBurariPlaying }: Props) {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>
          <Clock />
        </li>
        <li className={styles.logo}>Ultradonguri</li>
        <li className={styles.statusBadge}>
          {isBurariPlaying && <span className={styles.burariPlaying}>ぶらり旅再生中</span>}
          {isForceMuted && <span className={styles.forceMute}>強制ミュート中</span>}
        </li>
      </ul>
    </header>
  );
}
