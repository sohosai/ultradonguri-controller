import styles from "./index.module.css";


type Props = {};

export default function ConversionBuraritabiButtons({}: Props) {

    return (
        <div className={styles.play_stopButtons}>
            <div className={styles.playButton}>
                <p>再生</p>
            </div>
            <div className={styles.stopButton}>
                <p>停止</p>
            </div>
        </div>
    );
}