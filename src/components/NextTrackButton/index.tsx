import styles from "./index.module.css";

type Props = {
  onNext?: () => void;
  disabled?: boolean;
};

export default function NextTrackButton({ onNext, disabled }: Props) {
  return (
    <div
      className={`${styles.nextTrackButton} ${disabled ? styles.disabled : ""}`}
      onClick={() => {
        if (!disabled) {
          onNext?.();
        }
      }}
    >
      送出
    </div>
  );
}
