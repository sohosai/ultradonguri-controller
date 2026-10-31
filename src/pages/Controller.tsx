import { useEffect, useState, useRef, useMemo } from "react";

import { postDisplayCopyright, postConversionCmMode } from "../api/http/endpoints";
import { obsClient } from "../api/obs/obsClient";
import { streamClient } from "../api/ws/streamClient";
import Buttons from "../components/Buttons";
import ConversionMenu from "../components/ConversionMenu";
import DateChangeConfirmModal from "../components/DateChangeConfirmModal";
import DateTabs from "../components/DateTabs";
import Menu from "../components/DetailMenu";
import Header from "../components/Header";
import Musics from "../components/Musics";
import Performances from "../components/Performances";
import { getConversionById } from "../data/conversions";
import useObsMute from "../hooks/useObsMute";
import usePerformances from "../hooks/usePerformances";
import usePlayback from "../hooks/usePlayback";
import { saveConvTimings, saveSongTimings } from "../lib/songTiming";
import { findNextTrackRef } from "../lib/tracks";
import { sendConversionStart, sendMusic, sendPerformanceStart } from "../services/performanceService";
import { formatToYmd } from "../utils/dateFormat";

import styles from "./Controller.module.css";

import type { Conversion, Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

const OBS_DISCONNECTED_ERROR = "OBS に接続できません（OBS の起動と OBS_WEBSOCKET_URL を確認してください）";
const OBS_AUTH_FAILED_ERROR = "OBS の認証に失敗しました（OBS_WEBSOCKET_PASSWORD を確認してください）";

export default function Controller() {
  const { performances, isLoading, error: fetchError, updatePerformances } = usePerformances();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isMuted, connectionStatus: obsConnectionStatus, setMuted } = useObsMute();
  const [isCmMode, setIsCmMode] = useState<boolean>(false);
  const [isCopyrightVisible, setIsCopyrightVisible] = useState<boolean>(true);
  const [isBurariPlaying, setIsBurariPlaying] = useState(false);
  const [burariPlayingFilename, setBurariPlayingFilename] = useState<string | null>(null);
  const { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst } = usePlayback();
  const initializedDateKeyRef = useRef<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [pendingDateKey, setPendingDateKey] = useState<string | null>(null);

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

  // 再接続を繰り返す間に同じエラーを出し直さないよう、未接続になったら1回だけ出す
  const hasReportedObsDisconnectRef = useRef(false);
  useEffect(() => {
    if (obsConnectionStatus === "connected") {
      hasReportedObsDisconnectRef.current = false;
      setError((prev) => (prev === OBS_DISCONNECTED_ERROR || prev === OBS_AUTH_FAILED_ERROR ? null : prev));
    } else if (obsConnectionStatus === "authFailed") {
      setError(OBS_AUTH_FAILED_ERROR);
    } else if (obsConnectionStatus === "disconnected" && !hasReportedObsDisconnectRef.current) {
      hasReportedObsDisconnectRef.current = true;
      setError(OBS_DISCONNECTED_ERROR);
    }
  }, [obsConnectionStatus]);

  // 1曲目のミュート指示。ページを開いた直後は OBS への接続が済んでいないので、接続してから掛ける
  const [pendingInitialMute, setPendingInitialMute] = useState<boolean | null>(null);
  useEffect(() => {
    if (pendingInitialMute === null || obsConnectionStatus !== "connected") return;

    setPendingInitialMute(null);
    setMuted(pendingInitialMute).catch((error) => {
      console.error("[Controller] Failed to apply initial mute:", error);
      setError("1曲目のミュートの切り替えに失敗しました");
    });
  }, [pendingInitialMute, obsConnectionStatus, setMuted]);

  useEffect(() => {
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

    void initializeCopyright();
    void initializeCmMode();
  }, []);

  useEffect(() => {
    const scene = isBurariPlaying ? "burari" : isCmMode ? "cm" : "normal";
    obsClient.setScene(scene).catch((error) => {
      console.error("[Controller] Failed to switch scene:", error);
    });
  }, [isCmMode, isBurariPlaying]);

  useEffect(() => {
    const unsubPlay = streamClient.on("/burari/play", (data) => {
      setIsBurariPlaying(true);
      const payload = data as { filename: string } | undefined;
      setBurariPlayingFilename(payload?.filename ?? null);
    });
    const unsubStop = streamClient.on("/burari/stop", () => {
      setIsBurariPlaying(false);
      setBurariPlayingFilename(null);
    });
    const unsubEnded = streamClient.on("/burari/ended", () => {
      streamClient.send("/burari/stop", {});
      setIsBurariPlaying(false);
      setBurariPlayingFilename(null);
    });

    return () => {
      unsubPlay();
      unsubStop();
      unsubEnded();
    };
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
          if (firstMusic) {
            await sendMusic(firstMusic);
            // 1曲目が配信NGなら自動ミュート
            setPendingInitialMute(firstMusic.should_be_muted);
          }
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

  const isConversion = currentTrack?.type === "conversion";

  const handleSelectNextTrack = (ref: TrackRef) => {
    selectNextTrack(ref);
  };

  const handleDateTabChange = (key: string) => {
    if (isCmMode || key === selectedDateKey) return;
    setPendingDateKey(key);
  };

  const handleConfirmDateChange = () => {
    if (pendingDateKey) setSelectedDateKey(pendingDateKey);
    setPendingDateKey(null);
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

        // 転換パート用のCSV保存関数を呼び出す
        if (conversion) {
          saveConvTimings(conversion);
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
          if (music.should_be_muted && !isMuted) {
            // 配信NGの曲は即時ミュート
            await setMuted(true);
          } else if (!music.should_be_muted && isMuted) {
            // 配信OKの曲が来たら自動でミュート解除
            await setMuted(false);
          }
        }

        // 楽曲用のCSV保存関数を呼び出す
        if (music && newPlayingPerf) {
          saveSongTimings(music, newPlayingPerf);
        }

        // API成功後に状態を更新
        skipToNext(list);
        if (newPlayingPerf) {
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
    <div className={styles.controller}>
      <Header isMuted={isMuted} isBurariPlaying={isBurariPlaying} />
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
            <DateTabs
              dateKeys={dateKeys}
              selected={selectedDateKey}
              onChange={handleDateTabChange}
              disabled={isCmMode}
            />
            <Performances
              items={scopedPerformances || []}
              selectedPerformance={selectedPerformance}
              selectedConversion={selectedConversion}
              currentTrack={currentTrack}
              onSelectPerformance={handleSelectPerformance}
              onSelectConversion={handleSelectConversion}
            />
            <Menu performances={performances} onSave={updatePerformances} />
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
              {selectedConversion && (
                <ConversionMenu
                  isCmMode={isCmMode}
                  onCmModeChange={setIsCmMode}
                  conversionId={selectedConversion.id}
                  currentTrack={currentTrack}
                  nextTrack={nextTrack}
                  onSelectNextTrack={handleSelectNextTrack}
                  isBurariPlaying={isBurariPlaying}
                  burariPlayingFilename={burariPlayingFilename}
                />
              )}
            </div>
            <Buttons
              onNext={handleNext}
              isMuted={isMuted}
              onMuteChange={setMuted}
              isCopyrightVisible={isCopyrightVisible}
              onCopyrightVisibleChange={handleCopyrightVisibleChange}
              onError={setError}
              isCmMode={isCmMode}
              isConversion={isConversion}
              isBurariPlaying={isBurariPlaying}
            />
          </div>
        </div>
      </main>
      {pendingDateKey && (
        <DateChangeConfirmModal
          currentDateKey={selectedDateKey ?? ""}
          nextDateKey={pendingDateKey}
          onConfirm={handleConfirmDateChange}
          onCancel={() => setPendingDateKey(null)}
        />
      )}
    </div>
  );
}
