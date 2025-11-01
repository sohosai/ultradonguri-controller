import styles from "./index.module.css";

type PerformanceSceneProps = {
  performer: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  shouldBeMuted: boolean | null;
  isCopyrightVisible: boolean;
};

export default function PerformanceScene({
  performer,
  musicTitle,
  musicArtist,
  shouldBeMuted,
  isCopyrightVisible,
}: PerformanceSceneProps) {
  return (
    <div className={styles.container}>
      {performer && (
        <div key={performer} className={styles.performer}>
          <div className={styles.performerTitle}>{performer}</div>
          <div className={styles.orangeObject}></div>
        </div>
      )}
      {musicTitle && (
        <>
          <div key={musicTitle} className={styles.musicTitle}>
            ♫ {musicTitle} {musicArtist && `/ ${musicArtist}`}
          </div>
        </>
      )}
      {isCopyrightVisible && shouldBeMuted === true && (
        <div key={`muted-${musicTitle}`} className={styles.shouldBeMuted}>
          著作権上の都合で音声を削除しています
        </div>
      )}
    </div>
  );
}
