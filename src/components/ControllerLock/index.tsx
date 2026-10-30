import { useEffect, useState } from "react";

import styles from "./index.module.css";

import type { ReactNode } from "react";

const LOCK_NAME = "ultradonguri-controller";

type LockState = "pending" | "waiting" | "acquired";

type Props = {
  children: ReactNode;
};

/**
 * controller を1つのタブでだけ表示する
 *
 * 2つ目のタブが Controller を表示すると、開いた直後の初期化（1曲目の送出やシーン切替）で送出中の状態を巻き戻し、
 * OBS のミュートもタブ同士でかけ直し合う。ロックを取れたタブだけが表示し、ほかのタブはロックが空くまで待つ。
 * ロックはタブを閉じるとブラウザが外す。
 */
export default function ControllerLock({ children }: Props) {
  const [lockState, setLockState] = useState<LockState>("pending");

  useEffect(() => {
    const abortController = new AbortController();
    let release = () => {};

    navigator.locks
      .request(LOCK_NAME, { signal: abortController.signal }, () => {
        setLockState("acquired");

        return new Promise<void>((resolve) => {
          release = resolve;
        });
      })
      .catch((error: unknown) => {
        // アンマウントで待機をやめたときの AbortError
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("[ControllerLock] Failed to acquire lock:", error);
      });

    // 別のタブがロックを持っているときだけ待機の表示にする。ロックを取るまでの一瞬に表示を出さないため
    void navigator.locks.query().then(({ held }) => {
      if (held?.some((lock) => lock.name === LOCK_NAME)) {
        setLockState((prev) => (prev === "pending" ? "waiting" : prev));
      }
    });

    return () => {
      abortController.abort();
      release();
    };
  }, []);

  if (lockState === "pending") return null;

  if (lockState === "waiting") {
    return (
      <div className={styles.message}>
        <p>コントローラーは別のタブで開かれています。</p>
        <p>そのタブを閉じると、このタブで操作できるようになります。</p>
      </div>
    );
  }

  return children;
}
