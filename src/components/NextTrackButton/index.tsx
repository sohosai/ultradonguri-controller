import styles from "./index.module.css";

type Props = {
  onNext?: () => void;
};

export default function NextTrackButton({ onNext }: Props) {
  return (
    <div className={styles.nextTrackButton} onClick={onNext}>
      次の曲を再生
    </div>
  );
}
