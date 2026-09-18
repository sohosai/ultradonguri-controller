import styles from "./index.module.css";


type Props = {};

export default function ConversionBuraritabiSourcce({ }: Props) {

    return (
        <div className={styles.sourceTable}>
            <div className={styles.sourceChoice}>
                <p>動画を選択</p>
                <span>▼</span>
            </div>
            <div className={styles.sourceImage}>
                <img src="assets/icons/upload.svg" />
            </div>
            {/* ↑ ここに画像を挿入予定 */}
        </div>
    );
}