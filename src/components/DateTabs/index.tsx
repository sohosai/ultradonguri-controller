import styles from "./index.module.css";

type Props = {
  dateKeys: string[]; // YYYY-MM-DD の昇順
  selected: string | null;
  onChange: (key: string) => void;
};

export default function DateTabs({ dateKeys, selected, onChange }: Props) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="日付タブ">
      {dateKeys.map((key) => {
        const label = key.slice(5); // MM-DD 表示

        return (
          <button
            key={key}
            role="tab"
            aria-selected={selected === key}
            className={styles.tab}
            data-selected={selected === key}
            onClick={() => onChange(key)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
