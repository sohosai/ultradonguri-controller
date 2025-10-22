import { useEffect, useState, useRef } from "react";

import { postForceMute, postDisplayCopyright, postConversionCmMode } from "../api/http/endpoints";
import Buttons from "../components/Buttons";
import ConversionMenu from "../components/ConversionMenu";
import Menu from "../components/DetailMenu";
import Header from "../components/Header";
import Musics from "../components/Musics";
import Performances from "../components/Performances";
import { getConversionById } from "../data/conversions";
import usePerformances from "../hooks/usePerformances";
import usePlayback from "../hooks/usePlayback";
import { findNextTrackRef } from "../lib/tracks";
import { sendConversionStart, sendMusic, sendPerformanceStart } from "../services/performanceService";

import styles from "./Controller.module.css";

import type { Conversion, Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

export default function Controller() {
  const { performances, originalPerformances, isLoading, error: fetchError, refresh } = usePerformances();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isForceMuted, setIsForceMuted] = useState<boolean>(false);
  const [isCmMode, setIsCmMode] = useState<boolean>(false);
  const [isCopyrightVisible, setIsCopyrightVisible] = useState<boolean>(true);
  const { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst } = usePlayback();
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeForceMute = async () => {
      try {
        await postForceMute({ is_muted: false });
        setIsForceMuted(false);
      } catch (error) {
        console.error("[Controller] Failed to initialize force mute:", error);
      }
    };

    const initializeCopyright = async () => {
      try {
        await postDisplayCopyright({ is_displayed_copyright: true });
        setIsCopyrightVisible(true);
      } catch (error) {
        console.error("[Controller] Failed to initialize copyright:", error);
      }
    };

    const initializeCmMode = async () => {
      try {
        await postConversionCmMode({ is_cm_mode: false });
        setIsCmMode(false);
      } catch (error) {
        console.error("[Controller] Failed to initialize CM mode:", error);
      }
    };

    void initializeForceMute();
    void initializeCopyright();
    void initializeCmMode();
  }, []);

  useEffect(() => {
    if (!performances) return;

    if (!isInitialized.current) {
      if (performances.length === 0) {
        setSelectedPerformance(null);
        setSelectedConversion(null);
        reset();

        return;
      }

      const initializePerformances = async () => {
        const firstPerformance = performances[0];
        const firstMusic = firstPerformance.musics[0];

        setSelectedPerformance(firstPerformance);
        setSelectedConversion(null);
        initializeFromFirst(performances);

        try {
          await sendPerformanceStart(firstPerformance);
          if (firstMusic) await sendMusic(firstMusic);
        } catch (error) {
          console.error("[Controller] Failed to send initial data:", error);
          setError("初期データの送信に失敗しました");
        }
      };

      void initializePerformances();
      isInitialized.current = true;

      return;
    }

    if (selectedPerformance) {
      const updated = performances.find((p) => p.id === selectedPerformance.id);
      if (updated) setSelectedPerformance(updated);
    }
  }, [performances, initializeFromFirst, reset, selectedPerformance]);

  if (isLoading) return <div>読み込み中...</div>;
  if (fetchError) return <div>エラー: {fetchError.message}</div>;
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

  const handleCopyrightVisibleChange = async (isVisible: boolean) => {
    try {
      await postDisplayCopyright({ is_displayed_copyright: isVisible });
      setIsCopyrightVisible(isVisible);
    } catch (error) {
      console.error("[Controller] Failed to update copyright visibility:", error);
      setError("著作権表示の切り替えに失敗しました");
    }
  };

  const handleNext = async () => {
    if (!performances) return;
    if (!nextTrack) return;
    const prevNext = nextTrack;

    try {
      // nextTrackがconversionの場合
      if (prevNext.type === "conversion" && prevNext.conversionId) {
        const conversion = getConversionById(prevNext.conversionId);

        // POST /conversion/start
        // prevNext(conversion)の次のトラックを計算して、続く5つのパフォーマンスを取得
        const nextAfterConversion = findNextTrackRef(performances, prevNext);
        if (nextAfterConversion && nextAfterConversion.type === "music") {
          const nextPerformanceIndex = performances.findIndex((p) => p.id === nextAfterConversion.performanceId);

          if (nextPerformanceIndex >= 0) {
            // 続く5つのパフォーマンスを取得（最大5つ）
            const nextPerformances = performances.slice(nextPerformanceIndex, nextPerformanceIndex + 5);
            await sendConversionStart(nextPerformances);
          }
        }

        // API成功後に状態を更新
        skipToNext(performances);
        setSelectedConversion(conversion);
        setSelectedPerformance(null);
        setError(null);
      }
      // nextTrackがmusicの場合
      else if (prevNext.type === "music") {
        const newPlayingPerf = performances.find((p) => p.id === prevNext.performanceId) || null;
        const music = newPlayingPerf?.musics.find((m) => m.id === prevNext.musicId);
        const currentPerformanceId = currentTrack?.type === "music" ? currentTrack.performanceId : null;
        // POST /performance/start (パフォーマンスが変わった時のみ)
        if (newPlayingPerf && currentPerformanceId !== newPlayingPerf.id) {
          await sendPerformanceStart(newPlayingPerf);
        }

        // POST /performance/music
        if (music) {
          await sendMusic(music);
        }

        // API成功後に状態を更新
        skipToNext(performances);
        if (newPlayingPerf && currentPerformanceId !== newPlayingPerf.id) {
          setSelectedPerformance(newPlayingPerf);
          setSelectedConversion(null);
        }
        setError(null);
      }
    } catch (error) {
      console.error("[Controller] Failed to proceed to next track:", error);
      setError("次のトラックへの移動に失敗しました");
      // エラー時は状態を更新しない（前の状態を維持）
    }
  };

  return (
    <div>
      <Header isForceMuted={isForceMuted} />
      <main>
        {error && (
          <div className={styles.error}>
            <span className={styles.errorMessage}>エラー: {error}</span>
            <button
              onClick={() => setError(null)}
              className={styles.errorCloseButton}
              aria-label="エラーを閉じる"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <Performances
              items={performances}
              selectedPerformance={selectedPerformance}
              selectedConversion={selectedConversion}
              onSelectPerformance={handleSelectPerformance}
              onSelectConversion={handleSelectConversion}
            />
            <Menu performances={performances} originalPerformances={originalPerformances} onRefresh={refresh} />
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
              {selectedConversion && <ConversionMenu isCmMode={isCmMode} onCmModeChange={setIsCmMode} />}
            </div>
            <Buttons
              onNext={handleNext}
              isForceMuted={isForceMuted}
              onForceMuteChange={setIsForceMuted}
              isCopyrightVisible={isCopyrightVisible}
              onCopyrightVisibleChange={handleCopyrightVisibleChange}
              onError={setError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
