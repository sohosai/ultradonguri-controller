import Clock from "./clock.tsx";
import styles from "./index.module.css";

import type { ConnectionStatus } from "../../api/obs/obsClient";

type Props = {
  isMuted: boolean;
  obsConnectionStatus: ConnectionStatus;
  isBurariPlaying?: boolean;
};

export default function Header({ isMuted, obsConnectionStatus, isBurariPlaying }: Props) {
  return (
    <header className={styles.header}>
      <ul className={styles.list}>
        <li>
          <Clock />
        </li>
        <li className={styles.logo}>Ultradonguri</li>
        <li className={styles.statusBadge}>
          {isBurariPlaying && <span className={styles.burariPlaying}>ぶらり旅再生中</span>}
          {obsConnectionStatus === "authFailed" && <span className={styles.obsDisconnected}>OBS認証エラー</span>}
          {(obsConnectionStatus === "connecting" || obsConnectionStatus === "disconnected") && (
            <span className={styles.obsDisconnected}>OBS未接続</span>
          )}
          {isMuted && <span className={styles.mute}>ミュート中</span>}
        </li>
      </ul>
    </header>
  );
}
