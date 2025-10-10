import { useEffect, useState } from "react";

import styles from "./App.module.css";
import Buttons from "./components/Buttons";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Musics from "./components/Musics";
import Performances from "./components/Performances";
import usePerformances from "./hooks/usePerformances";
import usePlayback from "./hooks/usePlayback";

import type { Performance } from "./types/performances";
import type { TrackRef } from "./types/tracks";

function App() {
  const { performances } = usePerformances();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst } = usePlayback();

  useEffect(() => {
    // performances の変化に合わせて初期化（旧実装の振る舞いを維持）
    if (performances === null) return;
    if (performances.length > 0) {
      setSelectedPerformance(performances[0]);
      initializeFromFirst(performances);
    } else {
      setSelectedPerformance(null);
      reset();
    }
  }, [performances, initializeFromFirst, reset]);
  if (!performances) return <div>データが見つかりません。</div>;

  const handleSelectNextTrack = (ref: TrackRef) => {
    selectNextTrack(ref);
  };

  const handleNext = () => {
    if (!performances) return;
    if (!nextTrack) return;
    const prevNext = nextTrack;
    // 再生ポインタを進める
    skipToNext(performances);
    // currentTrack のパフォーマンスが変更されたら selectedPerformance も追随
    const newPlayingPerf = performances.find((p) => p.id === prevNext.performanceId) || null;
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
