import styles from "./index.module.css";

import UploadIcon from "../../assets/icons/upload.svg";


type Props = {};

export default function ConversionBuraritabiSourcce({ }: Props) {

    return (
        <div className={styles.sourceTable}>
            <div className={styles.sourceChoice}>
                <p>動画を選択</p>
                <span>▼</span>
            </div>
            <div className={styles.sourceImage}>
                <img src={UploadIcon} />
            </div>
        </div>
    );
}