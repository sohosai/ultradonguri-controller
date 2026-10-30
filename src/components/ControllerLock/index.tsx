import { useEffect, useState } from "react";

import styles from "./index.module.css";

import type { ReactNode } from "react";

const LOCK_NAME = "ultradonguri-controller";

type LockState = "pending" | "waiting" | "released" | "acquired";

type Props = {
  children: ReactNode;
};

/**
 * controller を1つのタブでだけ表示する
 *
 * 2つ目のタブが Controller を表示すると、開いた直後の初期化（1曲目の送出やシーン切替）で送出中の状態を巻き戻し、
 * OBS のミュートもタブ同士でかけ直し合う。ロックを取れたタブだけが表示し、ほかのタブは待機の表示にする。
 * ロックはタブを閉じるとブラウザが外す。外れても待機中のタブは自動では引き継がない。
 * 引き継ぐと初期化が走り、操作中のタブをリロードしただけで送出が巻き戻るため、ボタンを押したときだけ取りにいく。
 */
export default function ControllerLock({ children }: Props) {
  const [lockState, setLockState] = useState<LockState>("pending");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    let release = () => {};

    navigator.locks
      .request(LOCK_NAME, { ifAvailable: true }, (lock) => {
        // ifAvailable は signal と併用できないので、アンマウント済みかはここで見る
        if (signal.aborted) return;

        if (!lock) {
          setLockState("waiting");

          // 共有モードの要求は排他ロックが外れるまで待たされるので、外れたことを知るのに使う。取れたらすぐ返して外す
          return navigator.locks.request(LOCK_NAME, { mode: "shared", signal }, () => {
            if (!signal.aborted) setLockState("released");
          });
        }

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

    return () => {
      abortController.abort();
      release();
    };
  }, [attempt]);

  if (lockState === "pending") return null;

  if (lockState === "waiting") {
    return (
      <div className={styles.message}>
        <p>コントローラーは別のタブで開かれています。</p>
        <p>そのタブを閉じると、このタブで操作できるようになります。</p>
      </div>
    );
  }

  if (lockState === "released") {
    return (
      <div className={styles.message}>
        <p>別のタブが閉じられました。</p>
        <p>このタブで操作すると、1曲目の送出から始め直します。</p>
        <button
          className={styles.takeOverButton}
          onClick={() => {
            setLockState("pending");
            setAttempt((prev) => prev + 1);
          }}>
          このタブで操作する
        </button>
      </div>
    );
  }

  return children;
}
