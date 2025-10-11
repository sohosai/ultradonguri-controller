import MusicItem from "../MusicItem";

import styles from "./index.module.css";

import type { Music } from "../../types/performances";
import type { TrackRef } from "../../types/tracks";

type Props = {
  items: Music[];
  performanceId: string;
  currentTrack?: TrackRef | null;
  nextTrack?: TrackRef | null;
  onSelectNextTrack?: (ref: TrackRef) => void;
};

export default function Musics({ items, performanceId, currentTrack, nextTrack, onSelectNextTrack }: Props) {
  const isPlaying = (musicId: string) =>
    currentTrack?.performanceId === performanceId && currentTrack?.musicId === musicId;

  const isNext = (musicId: string) =>
    nextTrack?.performanceId === performanceId && nextTrack?.musicId === musicId;

  return (
    <ul className={styles.musics}>
      {items.map((m) => (
        <li key={m.id} onClick={() => onSelectNextTrack && onSelectNextTrack({ performanceId, musicId: m.id })}>
          <MusicItem music={m} isPlaying={isPlaying(m.id)} isNext={isNext(m.id)} />
        </li>
      ))}
    </ul>
  );
}
