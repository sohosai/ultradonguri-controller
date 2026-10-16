import { useEffect, useRef } from "react";

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
  const nextItemRef = useRef<HTMLDivElement | null>(null);

  const isPlaying = (musicId: string) =>
    currentTrack?.type === "music" &&
    currentTrack?.performanceId === performanceId &&
    currentTrack?.musicId === musicId;

  const isNext = (musicId: string) =>
    nextTrack?.type === "music" && nextTrack?.performanceId === performanceId && nextTrack?.musicId === musicId;

  useEffect(() => {
    nextItemRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, [nextTrack, performanceId]);

  return (
    <div className={styles.musicWrapper}>
      <ul className={styles.musics}>
        {items.map((m) => (
          <li
            key={m.id}
            onClick={() => onSelectNextTrack && onSelectNextTrack({ type: "music", performanceId, musicId: m.id })}>
            <MusicItem
              music={m}
              isPlaying={isPlaying(m.id)}
              isNext={isNext(m.id)}
              nextItemRef={
                isNext(m.id)
                  ? (node) => {
                      nextItemRef.current = node;
                    }
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
