import styles from "./index.module.css";

type PerformanceSceneProps = {
  performer: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  shouldBeMuted: boolean | null;
};

export default function PerformanceScene({ performer, musicTitle, musicArtist, shouldBeMuted }: PerformanceSceneProps) {
  return (
    <div className={styles.container}>
      {performer && (
        <div className={styles.performer}>
          {performer}
          <div className={styles.orangeObject}></div>
        </div>
      )}
      {musicTitle && (
        <>
          <div className={styles.musicTitle}>
            {musicTitle} / {musicArtist}
          </div>
          {shouldBeMuted === true && <div className={styles.shouldBeMuted}>著作権上の都合で音声を削除しています</div>}
        </>
      )}
    </div>
  );
}
