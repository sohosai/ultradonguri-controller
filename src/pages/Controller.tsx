import { useEffect, useState } from "react";

import Buttons from "../components/Buttons";
import ConversionMenu from "../components/ConversionMenu";
import Menu from "../components/DetailMenu";
import Header from "../components/Header";
import Musics from "../components/Musics";
import Performances from "../components/Performances";
import { getConversionById } from "../data/conversions";
import usePerformances from "../hooks/usePerformances";
import usePlayback from "../hooks/usePlayback";

import styles from "./Controller.module.css";

import type { Conversion, Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

export default function Controller() {
  const { performances } = usePerformances();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst } = usePlayback();

  useEffect(() => {
    if (performances === null) return;
    if (performances.length > 0) {
      setSelectedPerformance(performances[0]);
      setSelectedConversion(null);
      initializeFromFirst(performances);
    } else {
      setSelectedPerformance(null);
      setSelectedConversion(null);
      reset();
    }
  }, [performances, initializeFromFirst, reset]);

  if (!performances) return <div>データが見つかりません。</div>;

  const handleSelectNextTrack = (ref: TrackRef) => {
    selectNextTrack(ref);
  };

  const handleSelectPerformance = (performance: Performance) => {
    setSelectedPerformance(performance);
    setSelectedConversion(null);
  };

  const handleSelectConversion = (conversion: Conversion) => {
    setSelectedConversion(conversion);
    setSelectedPerformance(null);
  };

  const handleNext = () => {
    if (!performances) return;
    if (!nextTrack) return;
    const prevNext = nextTrack;
    // 再生ポインタを進める
    skipToNext(performances);

    // nextTrackがconversionの場合
    if (prevNext.type === "conversion" && prevNext.conversionId) {
      const conversion = getConversionById(prevNext.conversionId);
      setSelectedConversion(conversion);
      setSelectedPerformance(null);
    }
    // nextTrackがmusicの場合
    else if (prevNext.type === "music") {
      const newPlayingPerf = performances.find((p) => p.id === prevNext.performanceId) || null;
      if (newPlayingPerf && (!selectedPerformance || selectedPerformance.id !== newPlayingPerf.id)) {
        setSelectedPerformance(newPlayingPerf);
        setSelectedConversion(null);
      }
    }
  };

  return (
    <div>
      <Header />
      <main>
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <Performances
              items={performances}
              selectedPerformance={selectedPerformance}
              selectedConversion={selectedConversion}
              onSelectPerformance={handleSelectPerformance}
              onSelectConversion={handleSelectConversion}
            />
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
              {selectedConversion && <ConversionMenu conversion={selectedConversion} />}
            </div>
            <Buttons onNext={handleNext} />
          </div>
        </div>
      </main>
    </div>
  );
}
