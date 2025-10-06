import { useEffect, useState } from "react";

import styles from "./App.module.css";
import Header from "./components/Header";
import Musics from "./components/Musics";
import Performances from "./components/Performances";


import type { Performance } from "./types/performances";

function App() {
  const [data, setData] = useState<Performance[] | null>(null);
  const [selected, setSelected] = useState<Performance | null>(null);

  useEffect(() => {
    // データフェッチはバックエンドが出来たら変更する
    const url = `${import.meta.env.BASE_URL}mock.json`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = (await res.json()) as Performance[];
        setData(json);
      } catch (e) {
        console.error(e);
        setData([]);
      }
    })();
  }, []);
  if (!data) return <div>データが見つかりません。</div>;

  return (
    <div>
      <Header />
      <main>
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <div className={styles.performances}>
              <Performances items={data} onSelect={setSelected} />
            </div>
          </div>
          <div className={styles.rowRight}>
            <div className={styles.music}>{selected && <Musics items={selected.musics} />}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
