import { useEffect, useState } from "react";

import { streamClient } from "../api/ws/streamClient";
import PerformanceScene from "../components/PerformanceScene";
import ConversionScene from "../components/ConversionScene";

type SceneType = "performance" | "conversion" | null;

export default function Viewer() {
  const [currentScene, setCurrentScene] = useState<SceneType>(null);

  useEffect(() => {
    streamClient.connect();

    const handlePerformance = () => setCurrentScene("performance");
    const handleMusic = () => setCurrentScene("performance");
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
    return <PerformanceScene />;
  }

  if (currentScene === "conversion") {
    return <ConversionScene />;
  }

  return <div>待機中...</div>;
}
