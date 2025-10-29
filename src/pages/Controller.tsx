import { useEffect, useState, useRef, useMemo } from "react";

import { postForceMute, postDisplayCopyright, postConversionCmMode } from "../api/http/endpoints";
import Buttons from "../components/Buttons";
import ConversionMenu from "../components/ConversionMenu";
import Menu from "../components/DetailMenu";
import Header from "../components/Header";
import Musics from "../components/Musics";
import Performances from "../components/Performances";
import DateTabs from "../components/DateTabs";
import { getConversionById } from "../data/conversions";
import usePerformances from "../hooks/usePerformances";
import usePlayback from "../hooks/usePlayback";
import { findNextTrackRef } from "../lib/tracks";
import { sendConversionStart, sendMusic, sendPerformanceStart } from "../services/performanceService";
import { formatToYmd } from "../utils/dateFormat";

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
  const initializedDateKeyRef = useRef<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // グルーピング: 日付 -> performances（差分適用後）
  const { dateKeys, byDate } = useMemo(() => {
    const map = new Map<string, Performance[]>();

    if (performances) {
      for (const p of performances) {
        const key = formatToYmd(p.starts_at);
        const arr = map.get(key) ?? [];
        arr.push(p);
        map.set(key, arr);
      }
    }

    const keys = Array.from(map.keys()).sort();
    return { dateKeys: keys, byDate: map };
  }, [performances]);

  const scopedPerformances = useMemo<Performance[] | null>(() => {
    if (!selectedDateKey) return null;
    return byDate.get(selectedDateKey) ?? [];
  }, [byDate, selectedDateKey]);

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

  // 初回とデータ変化時に日付キーを初期化
  useEffect(() => {
    if (!performances) return;
    if (dateKeys.length === 0) {
      setSelectedDateKey(null);
      setSelectedPerformance(null);
      setSelectedConversion(null);
      reset();
      initializedDateKeyRef.current = null;

      return;
    }
    // リロード時は最初の日付
    if (!selectedDateKey) {
      setSelectedDateKey(dateKeys[0] || null);
    }
  }, [performances, dateKeys, reset, selectedDateKey]);

  // 日付選択の変更やスコープ変更時の初期化
  useEffect(() => {
    if (!scopedPerformances) return;
    if (scopedPerformances.length === 0) {
      setSelectedPerformance(null);
      setSelectedConversion(null);
      reset();
      initializedDateKeyRef.current = selectedDateKey;

      return;
    }

    const needInit = initializedDateKeyRef.current !== selectedDateKey;
    if (needInit) {
      const firstPerformance = scopedPerformances[0];
      const firstMusic = firstPerformance.musics[0];

      setSelectedPerformance(firstPerformance);
      setSelectedConversion(null);
      initializeFromFirst(scopedPerformances);

      const init = async () => {
        try {
          await sendPerformanceStart(firstPerformance);
          if (firstMusic) await sendMusic(firstMusic);
        } catch (error) {
          console.error("[Controller] Failed to send initial data:", error);
          setError("初期データの送信に失敗しました");
        }
      };
      void init();
      initializedDateKeyRef.current = selectedDateKey;

      return;
    }

    // データ更新時に選択が存在すれば同期
    if (selectedPerformance) {
      const updated = scopedPerformances.find((p) => p.id === selectedPerformance.id);
      if (updated) setSelectedPerformance(updated);
    }
  }, [scopedPerformances, initializeFromFirst, reset, selectedDateKey, selectedPerformance]);

  if (isLoading) return <div>読み込み中...</div>;
  if (fetchError) return <div>エラー: {fetchError.message}</div>;
  if (!performances) return <div>データが見つかりません。</div>;

  // コンバージョン中かどうかを判定
  const isConversion = selectedConversion !== null;

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
    const list = scopedPerformances;
    if (!list) return;
    if (!nextTrack) return;
    const prevNext = nextTrack;

    try {
      // nextTrackがconversionの場合
      if (prevNext.type === "conversion" && prevNext.conversionId) {
        const conversion = getConversionById(prevNext.conversionId);

        // conversion開始時に常にCMモードをfalseにリセット
        setIsCmMode(false);

        // POST /conversion/start
        // prevNext(conversion)の次のトラックを計算して、続く5つのパフォーマンスを取得
        const nextAfterConversion = findNextTrackRef(list, prevNext);
        if (nextAfterConversion && nextAfterConversion.type === "music") {
          const nextPerformanceIndex = list.findIndex((p) => p.id === nextAfterConversion.performanceId);

          if (nextPerformanceIndex >= 0) {
            // 続く5つのパフォーマンスを取得（最大5つ）
            const nextPerformances = list.slice(nextPerformanceIndex, nextPerformanceIndex + 5);
            await sendConversionStart(nextPerformances);
          }
        }

        // API成功後に状態を更新
        skipToNext(list);
        setSelectedConversion(conversion);
        setSelectedPerformance(null);
        setError(null);
      }
      // nextTrackがmusicの場合
      else if (prevNext.type === "music") {
        const newPlayingPerf = list.find((p) => p.id === prevNext.performanceId) || null;
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
        skipToNext(list);
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
            <button onClick={() => setError(null)} className={styles.errorCloseButton} aria-label="エラーを閉じる">
              ✕
            </button>
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <DateTabs dateKeys={dateKeys} selected={selectedDateKey} onChange={setSelectedDateKey} />
            <Performances
              items={scopedPerformances || []}
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
              isCmMode={isCmMode}
              isConversion={isConversion}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
