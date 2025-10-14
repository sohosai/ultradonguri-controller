import { useEffect, useState } from "react";

import { streamClient } from "../api/ws/streamClient";

export default function Viewer() {
  const [lastEvent, setLastEvent] = useState<{ type: string; data: unknown } | null>(null);

  useEffect(() => {
    streamClient.connect();

    const handleEvent = (type: string) => (data: unknown) => {
      setLastEvent({ type, data });
    };

    const unsubPerformance = streamClient.on('performance', handleEvent('performance'));
    const unsubMusic = streamClient.on('music', handleEvent('music'));
    const unsubConversion = streamClient.on('conversion/start', handleEvent('conversion/start'));
    const unsubCmMode = streamClient.on('conversion/cm-mode', handleEvent('conversion/cm-mode'));
    const unsubForceMute = streamClient.on('force_mute', handleEvent('force_mute'));

    return () => {
      unsubPerformance();
      unsubMusic();
      unsubConversion();
      unsubCmMode();
      unsubForceMute();
      streamClient.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Viewer</h1>
      {lastEvent ? (
        <pre>{JSON.stringify(lastEvent, null, 2)}</pre>
      ) : (
        <p>待機中...</p>
      )}
    </div>
  );
}
