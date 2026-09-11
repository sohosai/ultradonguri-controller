import Clock from "./clock.tsx";
import styles from "./index.module.css";

type Props = {
  isMuted: boolean;
  isCmMode?: boolean;
  isConversion?: boolean;
};

export default function Header({ isMuted, isCmMode = false, isConversion = false }: Props) {
  const isCMMute = isConversion && isCmMode && !isMuted;

  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>
          <Clock />
        </li>
        <li className={styles.logo}>Ultradonguri</li>
        <li className={styles.mute}>{isCMMute ? "強制ミュート中" : isMuted && "ミュート中"}</li>
      </ul>
    </header>
  );
}
