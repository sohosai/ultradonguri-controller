import styles from "./index.module.css";

type PerformanceSceneProps = {
  performer: string | null;
  musicTitle: string | null;
  shouldBeMuted: boolean | null;
};

export default function PerformanceScene({ performer, musicTitle, shouldBeMuted }: PerformanceSceneProps) {
  console.log("[PerformanceScene] shouldBeMuted:", shouldBeMuted, typeof shouldBeMuted);

  return (
    <div className={styles.container}>
      {performer && <div className={styles.performer}>{performer}</div>}
      {musicTitle && (
        <>
          <div className={styles.musicTitle}>{musicTitle}</div>
          {shouldBeMuted === true && <div className={styles.shouldBeMuted}>著作権上の都合で音声を削除しています</div>}
        </>
      )}
    </div>
  );
}
