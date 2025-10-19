import { useEffect, useState } from "react";

import { streamClient } from "../api/ws/streamClient";
import ConversionScene from "../components/ConversionScene";
import PerformanceScene from "../components/PerformanceScene";

import type { Performance, Music, NextPerformance } from "../types/performances";

type SceneType = "performance" | "conversion" | null;

export default function Viewer() {
  const [currentScene, setCurrentScene] = useState<SceneType>(null);
  const [performer, setPerformer] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState<string | null>(null);
  const [musicArtist, setMusicArtist] = useState<string | null>(null);
  const [shouldBeMuted, setShouldBeMuted] = useState<boolean | null>(null);
  const [nextPerformances, setNextPerformances] = useState<NextPerformance[]>([]);
  const [isCmMode, setIsCmMode] = useState<boolean>(false);
  const [isCopyrightVisible, setIsCopyrightVisible] = useState<boolean>(true);

  useEffect(() => {
    streamClient.connect();

    const handlePerformance = (data: unknown) => {
      setCurrentScene("performance");
      const payload = data as Performance;
      setPerformer(payload.performer);
    };

    const handleMusic = (data: unknown) => {
      setCurrentScene("performance");
      const payload = data as Music;
      setMusicTitle(payload.title);
      setMusicArtist(payload.artist);
      setShouldBeMuted(payload.should_be_muted);
    };

    const handleConversionStart = (data: unknown) => {
      setCurrentScene("conversion");
      const payload = data as { next_performances: NextPerformance[] };
      setNextPerformances(payload.next_performances || []);
    };

    const handleCmMode = (data: unknown) => {
      const payload = data as { is_cm_mode: boolean };
      setIsCmMode(payload.is_cm_mode);
      setCurrentScene("conversion");
    };

    const handleDisplayCopyright = (data: unknown) => {
      const payload = data as { is_displayed_copyright: boolean };
      setIsCopyrightVisible(payload.is_displayed_copyright);
    };

    const unsubPerformance = streamClient.on("/performance/start", handlePerformance);
    const unsubMusic = streamClient.on("/performance/music", handleMusic);
    const unsubConversion = streamClient.on("/conversion/start", handleConversionStart);
    const unsubCmMode = streamClient.on("/conversion/cm-mode", handleCmMode);
    const unsubDisplayCopyright = streamClient.on("/display-copyright", handleDisplayCopyright);

    return () => {
      unsubPerformance();
      unsubMusic();
      unsubConversion();
      unsubCmMode();
      unsubDisplayCopyright();
      streamClient.disconnect();
    };
  }, []);

  if (currentScene === "performance") {
    return (
      <PerformanceScene
        performer={performer}
        musicTitle={musicTitle}
        musicArtist={musicArtist}
        shouldBeMuted={shouldBeMuted}
        isCopyrightVisible={isCopyrightVisible}
      />
    );
  }

  if (currentScene === "conversion") {
    return <ConversionScene nextPerformances={nextPerformances} isCmMode={isCmMode} />;
  }

  return <div>待機中...</div>;
}
