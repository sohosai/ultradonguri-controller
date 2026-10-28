import { useEffect, useSyncExternalStore } from "react";

import { obsClient } from "../api/obs/obsClient";

import type { ConnectionStatus } from "../api/obs/obsClient";

type UseObsMuteResult = {
  isMuted: boolean;
  connectionStatus: ConnectionStatus;
  setMuted: (isMuted: boolean) => Promise<void>;
};

const setMuted = (isMuted: boolean) => obsClient.setMuted(isMuted);

export default function useObsMute(): UseObsMuteResult {
  useEffect(() => {
    obsClient.start();
  }, []);

  const { isMuted, connectionStatus } = useSyncExternalStore(obsClient.subscribe, obsClient.getSnapshot);

  return { isMuted, connectionStatus, setMuted };
}
