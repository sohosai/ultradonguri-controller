import { useEffect, useState } from "react";

import { streamClient } from "../api/ws/streamClient";
import PerformanceScene from "../components/PerformanceScene";
import ConversionScene from "../components/ConversionScene";
import type { Performance, Music } from "../types/performances";

type SceneType = "performance" | "conversion" | null;

export default function Viewer() {
  const [currentScene, setCurrentScene] = useState<SceneType>(null);
  const [performer, setPerformer] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState<string | null>(null);
  const [shouldBeMuted, setShouldBeMuted] = useState<boolean | null>(null);

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
      setShouldBeMuted(payload.music.should_be_muted);
    };

    const handleConversionStart = () => setCurrentScene("conversion");
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
    return <PerformanceScene performer={performer} musicTitle={musicTitle} shouldBeMuted={shouldBeMuted} />;
  }

  if (currentScene === "conversion") {
    return <ConversionScene />;
  }

  return <div>待機中...</div>;
}
