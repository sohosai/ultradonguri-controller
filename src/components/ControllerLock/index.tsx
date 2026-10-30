import { useEffect, useSyncExternalStore } from "react";

import styles from "./index.module.css";

import type { ReactNode } from "react";

const LOCK_NAME = "ultradonguri-controller";

type LockState = "pending" | "waiting" | "released" | "acquired";

type Props = {
  children: ReactNode;
};

// StrictMode の effect の再実行で要求が重なると、同じタブの1回目の要求が持つロックに2回目が負けるので、状態はコンポーネントの外に置く
let currentState: LockState = "pending";
let requested = false;
const listeners = new Set<() => void>();

function setLockState(next: LockState) {
  currentState = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function requestLock() {
  navigator.locks
    .request(LOCK_NAME, { ifAvailable: true }, (lock) => {
      if (!lock) {
        setLockState("waiting");

        // 共有モードの要求は排他ロックが外れるまで待たされるので、外れたことを知るのに使う。取れたらすぐ返して外す
        return navigator.locks.request(LOCK_NAME, { mode: "shared" }, () => {
          setLockState("released");
        });
      }

      setLockState("acquired");

      // タブを閉じるまで持ち続ける
      return new Promise<void>(() => {});
    })
    .catch((error: unknown) => {
      console.error("[ControllerLock] Failed to acquire lock:", error);
    });
}

/**
 * controller を1つのタブでだけ表示する
 *
 * 2つ目のタブが Controller を表示すると、開いた直後の初期化（1曲目の送出やシーン切替）で送出中の状態を巻き戻し、
 * OBS のミュートもタブ同士でかけ直し合う。ロックを取れたタブだけが表示し、ほかのタブは待機の表示にする。
 * ロックはタブを閉じるとブラウザが外す。外れても待機中のタブは自動では引き継がない。
 * 引き継ぐと初期化が走り、操作中のタブをリロードしただけで送出が巻き戻るため、ボタンを押したときだけ取りにいく。
 */
export default function ControllerLock({ children }: Props) {
  const lockState = useSyncExternalStore(subscribe, () => currentState);

  useEffect(() => {
    if (requested) return;
    requested = true;
    requestLock();
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

  if (lockState === "released") {
    return (
      <div className={styles.message}>
        <p>別のタブが閉じられました。</p>
        <p>このタブで操作すると、1曲目の送出から始め直します。</p>
        <button
          className={styles.takeOverButton}
          onClick={() => {
            setLockState("pending");
            requestLock();
          }}>
          このタブで操作する
        </button>
      </div>
    );
  }

  return children;
}
