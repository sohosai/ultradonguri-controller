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

  useEffect(() => {
    streamClient.connect();

    const handlePerformance = (data: unknown) => {
      setCurrentScene("performance");
      const payload = data as { performance: Performance };
      setPerformer(payload.performance.performer);
    };

    const handleMusic = (data: unknown) => {
      setCurrentScene("performance");
      const payload = data as { music: Music };
      setMusicTitle(payload.music.title);
      setMusicArtist(payload.music.artist);
      setShouldBeMuted(payload.music.should_be_muted);
    };

    const handleConversionStart = (data: unknown) => {
      setCurrentScene("conversion");
      const payload = data as { next_performances: NextPerformance[] };
      setNextPerformances(payload.next_performances || []);
    };

    const handleCmMode = () => setCurrentScene("conversion");

    const unsubPerformance = streamClient.on("performance", handlePerformance);
    const unsubMusic = streamClient.on("music", handleMusic);
    const unsubConversion = streamClient.on("conversion/start", handleConversionStart);
    const unsubCmMode = streamClient.on("conversion/cm-mode", handleCmMode);

    return () => {
      unsubPerformance();
      unsubMusic();
      unsubConversion();
      unsubCmMode();
      streamClient.disconnect();
    };
  }, []);

  if (currentScene === "performance") {
    return <PerformanceScene performer={performer} musicTitle={musicTitle} musicArtist={musicArtist} shouldBeMuted={shouldBeMuted} />;
  }

  if (currentScene === "conversion") {
    return <ConversionScene nextPerformances={nextPerformances} />;
  }

  return <div>待機中...</div>;
}
