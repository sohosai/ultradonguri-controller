import { useEffect, useState, useRef, useMemo } from "react";

import {
  postDisplayCopyright,
  postConversionCmMode,
  postBurariScene,
  postCmScene,
  postNormalScene,
} from "../api/http/endpoints";
import { postMute } from "../api/http/osechi";
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
import usePerformances from "../hooks/usePerformances";
import usePlayback from "../hooks/usePlayback";
import { loadPlaybackState, savePlaybackState } from "../lib/playbackStateStorage";
import { saveConvTimings, saveSongTimings } from "../lib/songTiming";
import { containsTrack, findNextTrackRef } from "../lib/tracks";
import { sendConversionStart, sendMusic, sendPerformanceStart } from "../services/performanceService";
import { formatToYmd } from "../utils/dateFormat";

import styles from "./Controller.module.css";

import type { Conversion, Performance } from "../types/performances";
import type { TrackRef } from "../types/tracks";

export default function Controller() {
  const { performances, isLoading, error: fetchError, updatePerformances } = usePerformances();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedState] = useState(loadPlaybackState);
  const restorePendingRef = useRef(savedState !== null);
  const [isPlaybackReady, setIsPlaybackReady] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCmMode, setIsCmMode] = useState<boolean>(false);
  const [isCopyrightVisible, setIsCopyrightVisible] = useState<boolean>(savedState?.isCopyrightVisible ?? true);
  const [isBurariPlaying, setIsBurariPlaying] = useState(false);
  const [burariPlayingFilename, setBurariPlayingFilename] = useState<string | null>(null);
  const { currentTrack, nextTrack, selectNextTrack, skipToNext, reset, initializeFromFirst, restore } = usePlayback();
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

  useEffect(() => {
    const initializeMute = async () => {
      try {
        const state = await postMute({ is_muted: false });
        setIsMuted(state.is_muted);
      } catch (error) {
        console.error("[Controller] Failed to initialize mute:", error);
      }
    };

    const initializeCopyright = async () => {
      const isVisible = savedState?.isCopyrightVisible ?? true;
      try {
        await postDisplayCopyright({ is_displayed_copyright: isVisible });
        setIsCopyrightVisible(isVisible);
      } catch (error) {
        console.error("[Controller] Failed to initialize copyright:", error);
      }
    };

    const initializeCmMode = async () => {
      // 転換中に CM のまま閉じた場合は、転換情報を送った後に復元側で CM を送る（先に送ると Viewer の CM 画面が次の団体なしで描かれてしまう）
      if (savedState?.currentTrack?.type === "conversion" && savedState.isCmMode) return;
      try {
        await postConversionCmMode({ is_cm_mode: false });
        setIsCmMode(false);
      } catch (error) {
        console.error("[Controller] Failed to initialize CM mode:", error);
      }
    };

    void initializeMute();
    void initializeCopyright();
    void initializeCmMode();
  }, [savedState]);

  useEffect(() => {
    const switchScene = async () => {
      try {
        if (isCmMode) {
          await postCmScene();
        } else if (isBurariPlaying) {
          await postBurariScene();
        } else {
          await postNormalScene();
        }
      } catch (error) {
        console.error("[Controller] Failed to switch scene:", error);
      }
    };

    void switchScene();
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
    // リロード時は前回の日付（データに無ければ最初の日付）
    if (!selectedDateKey) {
      const savedDateKey = savedState?.dateKey;
      setSelectedDateKey(savedDateKey && dateKeys.includes(savedDateKey) ? savedDateKey : dateKeys[0] || null);
    }
  }, [performances, dateKeys, reset, selectedDateKey, savedState]);

  // 日付選択の変更やスコープ変更時の初期化
  useEffect(() => {
    if (!scopedPerformances) return;
    if (scopedPerformances.length === 0) {
      setSelectedPerformance(null);
      setSelectedConversion(null);
      reset();
      initializedDateKeyRef.current = selectedDateKey;
      setIsPlaybackReady(true);

      return;
    }

    const needInit = initializedDateKeyRef.current !== selectedDateKey;

    // 開いた直後だけ、前回の再生位置から再開する（日付タブで日付を変えたときは最初の曲から）
    if (needInit && restorePendingRef.current) {
      restorePendingRef.current = false;
      const saved = savedState?.dateKey === selectedDateKey ? savedState.currentTrack : null;

      if (saved && containsTrack(scopedPerformances, saved)) {
        const savedNext = savedState?.nextTrack;
        const next =
          savedNext && containsTrack(scopedPerformances, savedNext)
            ? savedNext
            : findNextTrackRef(scopedPerformances, saved);
        restore(saved, next);
        initializedDateKeyRef.current = selectedDateKey;
        setIsPlaybackReady(true);

        // 再生中のトラックを配信側に送り直し、テロップとシーンを元に戻す
        const resend = async () => {
          try {
            if (saved.type === "music") {
              const performance = scopedPerformances.find((p) => p.id === saved.performanceId);
              const music = performance?.musics.find((m) => m.id === saved.musicId);
              if (!performance || !music) return;

              setSelectedPerformance(performance);
              setSelectedConversion(null);
              await sendPerformanceStart(performance);
              await sendMusic(music);
              // ミュートは曲の配信可否に従う
              const state = await postMute({ is_muted: music.should_be_muted });
              setIsMuted(state.is_muted);
            } else {
              setSelectedConversion(getConversionById(saved.conversionId));
              setSelectedPerformance(null);
              // 転換の後に続く団体（最大5つ）を送る
              const nextAfterConversion = findNextTrackRef(scopedPerformances, saved);
              if (nextAfterConversion?.type === "music") {
                const index = scopedPerformances.findIndex((p) => p.id === nextAfterConversion.performanceId);
                if (index >= 0) await sendConversionStart(scopedPerformances.slice(index, index + 5));
              }
              if (savedState?.isCmMode) {
                await postConversionCmMode({ is_cm_mode: true });
                setIsCmMode(true);
              }
            }
          } catch (error) {
            console.error("[Controller] Failed to resend restored data:", error);
            setError("前回の状態の復元に失敗しました");
          }
        };
        void resend();

        return;
      }
    }

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
            const state = await postMute({ is_muted: firstMusic.should_be_muted });
            setIsMuted(state.is_muted);
          }
        } catch (error) {
          console.error("[Controller] Failed to send initial data:", error);
          setError("初期データの送信に失敗しました");
        }
      };
      void init();
      initializedDateKeyRef.current = selectedDateKey;
      setIsPlaybackReady(true);

      return;
    }

    // データ更新時に選択が存在すれば同期
    if (selectedPerformance) {
      const updated = scopedPerformances.find((p) => p.id === selectedPerformance.id);
      if (updated) setSelectedPerformance(updated);
    }
  }, [scopedPerformances, initializeFromFirst, reset, restore, savedState, selectedDateKey, selectedPerformance]);

  // 開き直したときに続きから再開できるよう、再生状態を保存する
  useEffect(() => {
    if (!isPlaybackReady || !selectedDateKey) return;
    savePlaybackState({ dateKey: selectedDateKey, currentTrack, nextTrack, isCopyrightVisible, isCmMode });
  }, [isPlaybackReady, selectedDateKey, currentTrack, nextTrack, isCopyrightVisible, isCmMode]);

  if (isLoading) return <div>読み込み中...</div>;
  if (fetchError) return <div>エラー: {fetchError.message}</div>;
  if (!performances) return <div>データが見つかりません。</div>;

  const isConversion = currentTrack?.type === "conversion";

  const handleSelectNextTrack = (ref: TrackRef) => {
    selectNextTrack(ref);
  };

  const handleDateTabChange = (key: string) => {
    if (key === selectedDateKey) return;
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
            const state = await postMute({ is_muted: true });
            setIsMuted(state.is_muted);
          } else if (!music.should_be_muted && isMuted) {
            // 配信OKの曲が来たら自動でミュート解除
            const state = await postMute({ is_muted: false });
            setIsMuted(state.is_muted);
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
            <DateTabs dateKeys={dateKeys} selected={selectedDateKey} onChange={handleDateTabChange} />
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
              onMuteChange={setIsMuted}
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
