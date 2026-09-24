import ConversionBuraritabiSourcce from "../ConversionBuraritabiSource";
import ConversionBuraritabiPreview from "../ConversionBuraritabiPreview";
import ConversionBuraritabiButtons from "../ConversionBuraritabiButtons";
import styles from "./index.module.css";


type Props = {};

export default function ConversionBuraritabi({}: Props) {

    return (
        <div className={styles.conversionBuraritabi}>
            <div className={styles.info}>
                <p className={styles.buraritabi}>
                    ぶらり旅
                </p>
                <div className={styles.source}>
                    <p>ソース</p>
                    <ConversionBuraritabiSourcce/>
                </div>
                <div className={styles.preview}>
                    <p>プレビュー</p>
                    <ConversionBuraritabiPreview/>
                </div>
                <div className={styles.start_stop}>
                    <ConversionBuraritabiButtons/>
                </div>
            </div>
        </div>
    );

}