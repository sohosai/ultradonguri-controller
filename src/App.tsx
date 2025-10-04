import { useEffect, useState } from "react";
import "./App.css";
import type { Performance } from "./types/performances";
import Performances from "./components/Performances";
import Header from "./components/Header";

function App() {

  const [data, setData] = useState<Performance[] | null>(null);

  useEffect(() => {
    // データフェッチはバックエンドが出来たら変更する
    const url = `${import.meta.env.BASE_URL}mock.json`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = (await res.json()) as Performance[];
        setData(json);
      }catch(e){
        console.error(e);
        setData([]);
      }
    })();
  }, []);
  if (!data) return <div>データが見つかりません。</div>;

  return (
    <main>
      <Header />
      <Performances items={data} />
    </main>
  );
}

export default App;
