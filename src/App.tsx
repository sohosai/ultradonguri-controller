import { useEffect, useState } from "react";
import "./App.css";

function App() {
  type Music = {
    id: string;
    title: string;
    artist: string;
    should_be_muted: boolean;
    intro: string;
  };

  type Performance = {
    id: string;
    title: string;
    performer: string;
    description: string;
    starts_at: string;
    ends_at: string;
    musics: Music[];
  };

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
    <>
      <h1>Ultradonguri</h1>
      <h2>パフォーマンス一覧</h2>
      <ul>
        {data.map((p) => (
          <li key={p.id}>
            <div>{p.title}</div>
            <ul>
              {p.musics.map((m) => (
                <li key={m.id}>
                  {m.title}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
