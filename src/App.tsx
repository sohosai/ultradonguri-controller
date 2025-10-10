import { useEffect, useState } from "react";

import styles from "./App.module.css";
import Buttons from "./components/Buttons";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Musics from "./components/Musics";
import Performances from "./components/Performances";

import type { Performance } from "./types/performances";

type TrackRef = { performanceId: string; musicId: string };

const findNextTrackRef = (list: Performance[], current: TrackRef | null): TrackRef | null => {
  if (!current) return null;
  const flattened: TrackRef[] = [];
  for (const p of list) {
    for (const m of p.musics) {
      flattened.push({ performanceId: p.id, musicId: m.id });
    }
  }
  const idx = flattened.findIndex(
    (r) => r.performanceId === current.performanceId && r.musicId === current.musicId
  );
  if (idx < 0) return null;
  return flattened[idx + 1] ?? null;
};

function App() {
  const [performances, setPerformances] = useState<Performance[] | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [currentTrack, setCurrentTrack] = useState<TrackRef | null>(null);
  const [nextTrack, setNextTrack] = useState<TrackRef | null>(null);

  useEffect(() => {
    // データフェッチはバックエンドが出来たら変更する
    const url = `${import.meta.env.BASE_URL}mock.json`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = (await res.json()) as Performance[];
        setPerformances(json);
        // 初期選択は先頭のデータ
        if (json.length > 0) {
          setSelectedPerformance(json[0]);
          const firstPerf = json[0];
          const firstMusic = firstPerf.musics[0];
          if (firstMusic) {
            const firstRef: TrackRef = { performanceId: firstPerf.id, musicId: firstMusic.id };
            setCurrentTrack(firstRef);
            // 次曲（同パフォ内の次 or 全体で次）
            const nextRef = findNextTrackRef(json, firstRef);
            setNextTrack(nextRef);
          } else {
            setCurrentTrack(null);
            setNextTrack(null);
          }
        } else {
          setSelectedPerformance(null);
          setCurrentTrack(null);
          setNextTrack(null);
        }
      } catch (e) {
        console.error(e);
        setPerformances([]);
        setSelectedPerformance(null);
        setCurrentTrack(null);
        setNextTrack(null);
      }
    })();
  }, []);
  if (!performances) return <div>データが見つかりません。</div>;

  const handleSelectNextTrack = (ref: TrackRef) => {
    setNextTrack(ref);
  };

  const handleNext = () => {
    if (!performances) return;
    if (!nextTrack) return;
    // nextTrack を currentTrack に昇格
    setCurrentTrack(nextTrack);
    // 新しい nextTrack を決定
    const next = findNextTrackRef(performances, nextTrack);
    setNextTrack(next);
    // currentTrack のパフォーマンスが変更されたら selectedPerformance も追随
    const newPlayingPerf = performances.find((p) => p.id === nextTrack.performanceId) || null;
    if (newPlayingPerf && (!selectedPerformance || selectedPerformance.id !== newPlayingPerf.id)) {
      setSelectedPerformance(newPlayingPerf);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <Performances items={performances} onSelect={setSelectedPerformance} />
            <Menu />
          </div>
          <div className={styles.rowRight}>
            <div className={styles.musics}>
              {selectedPerformance && (
                <Musics
                  items={selectedPerformance.musics}
                  performanceId={selectedPerformance.id}
                  currentTrack={currentTrack}
                  nextTrack={nextTrack}
                  onSelectNextTrack={handleSelectNextTrack}
                />
              )}
            </div>
            <Buttons onNext={handleNext} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
