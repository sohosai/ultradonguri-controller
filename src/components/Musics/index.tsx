import MusicItem from "../MusicItem";

import styles from "./index.module.css";

import type { Music } from "../../types/performances";
import type { Status } from "../../types/status";

type TrackRef = {
  performanceId: string;
  musicId: string;
};

type Props = {
  items: Music[];
  performanceId: string;
  currentTrack?: TrackRef | null;
  nextTrack?: TrackRef | null;
  onSelectNextTrack?: (ref: TrackRef) => void;
};

export default function Musics({ items, performanceId, currentTrack, nextTrack, onSelectNextTrack }: Props) {
  const getStatus = (musicId: string): Status => {
    if (currentTrack && currentTrack.performanceId === performanceId && currentTrack.musicId === musicId)
      return "playing";
    if (nextTrack && nextTrack.performanceId === performanceId && nextTrack.musicId === musicId) return "next";
    return "default";
  };

  return (
    <ul className={styles.musics}>
      {items.map((m) => (
        <li key={m.id} onClick={() => onSelectNextTrack && onSelectNextTrack({ performanceId, musicId: m.id })}>
          <MusicItem music={m} status={getStatus(m.id)} />
        </li>
      ))}
    </ul>
  );
}
