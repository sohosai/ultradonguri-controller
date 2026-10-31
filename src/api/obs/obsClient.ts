import OBSWebSocket, { EventSubscription, OBSWebSocketError } from "obs-websocket-js/json";

/**
 * OBS WebSocket クライアント
 *
 * OBS の音声を持つ入力すべてのミュートを「ミュート指示」に合わせる。
 * OBS のミュートボタンは donguri 専用として扱い、接続時と入力の変化のたびに指示どおりへかけ直す。
 * 番組シーンは「シーン指示」に合わせ、指示が変わったときと接続時に切り替える。
 * 詳細は docs/obs-mute.md と docs/obs-scene.md を参照。
 */

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "authFailed";

export interface ObsMuteSnapshot {
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
}

export type ObsScene = "normal" | "cm" | "burari";

interface ObsConfig {
  url: string;
  password: string;
  scenes: Record<ObsScene, string>;
}

// 接続先とパスワードは、controller のサーバーが実行時の環境変数から返す（server/donguriServerPlugin.ts）
const CONFIG_PATH = "/obs/config";
const MUTED_STORAGE_KEY = "obs_muted";
const RECONNECT_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 3000;

const CLOSE_AUTHENTICATION_FAILED = 4009;
const STATUS_RESOURCE_NOT_FOUND = 600;
// 音声を持たない入力に GetInputMute / SetInputMute を送ると返る
const STATUS_INVALID_RESOURCE_STATE = 604;

const isMockMode = (import.meta.env.VITE_API_MODE || "mock") === "mock";

// obs-websocket-js のリクエストにはタイムアウトがなく、切断すると応答待ちの Promise が永久に解決しない
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("OBS への要求がタイムアウトしました")), REQUEST_TIMEOUT_MS);
    }),
  ]);
}

class ObsClient {
  private obs: OBSWebSocket | null = null;
  private config: ObsConfig | null = null;
  private started = false;
  private connectionStatus: ConnectionStatus = "connecting";
  private desiredMuted = localStorage.getItem(MUTED_STORAGE_KEY) === "true";
  private desiredScene: ObsScene | null = null;
  // 音声を持つ入力の UUID → ミュート状態
  private audioInputs = new Map<string, boolean>();
  private snapshot: ObsMuteSnapshot = { connectionStatus: "connecting", isMuted: false };
  private listeners = new Set<() => void>();

  start(): void {
    if (this.started) return;
    this.started = true;

    if (isMockMode) {
      this.setConnectionStatus("connected");

      return;
    }

    fetch(CONFIG_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        return response.json() as Promise<ObsConfig>;
      })
      .then(
        (config) => {
          this.config = config;
          this.connect();
        },
        (error) => {
          console.error("[OBS] Failed to load config:", error);
          this.setConnectionStatus("disconnected");
        }
      );
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ObsMuteSnapshot => this.snapshot;

  /**
   * ミュート指示を変え、音声を持つ入力すべてに反映する
   * 未接続のときは待たずにエラーにする（接続後に古い指示が反映されるのを防ぐため）
   */
  async setMuted(isMuted: boolean): Promise<void> {
    if (!isMockMode && this.connectionStatus !== "connected") {
      throw new Error("OBS に接続していません");
    }

    this.desiredMuted = isMuted;
    localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted));
    this.notify();

    if (isMockMode) return;

    await this.applyMute([...this.audioInputs.keys()]);
  }

  /**
   * シーン指示を変え、接続中なら番組シーンを切り替える
   * 未接続のときは指示だけを持っておき、接続したときに切り替える
   */
  async setScene(scene: ObsScene): Promise<void> {
    this.desiredScene = scene;

    if (isMockMode || !this.obs || this.connectionStatus !== "connected") return;

    await this.applyScene(this.obs);
  }

  private connect(): void {
    if (!this.config) return;

    // 古い接続からのイベントを無視できるよう、接続ごとにインスタンスを作る
    const obs = new OBSWebSocket();
    this.obs = obs;
    this.setConnectionStatus("connecting");

    obs.on("ConnectionClosed", (error) => this.handleClosed(obs, error));
    obs.on("InputCreated", ({ inputUuid }) => {
      void this.handleInputCreated(obs, inputUuid);
    });
    obs.on("InputRemoved", ({ inputUuid }) => {
      if (obs !== this.obs) return;
      this.audioInputs.delete(inputUuid);
      this.notify();
    });
    obs.on("InputMuteStateChanged", ({ inputUuid, inputMuted }) => {
      if (obs !== this.obs || !this.audioInputs.has(inputUuid)) return;
      this.audioInputs.set(inputUuid, inputMuted);
      this.notify();
      if (inputMuted !== this.desiredMuted) {
        this.applyMute([inputUuid]).catch((error) => console.error("[OBS] Failed to reapply mute:", error));
      }
    });

    const { url, password } = this.config;
    obs.connect(url, password || undefined, { rpcVersion: 1, eventSubscriptions: EventSubscription.Inputs }).then(
      () => {
        if (obs !== this.obs) return;
        this.setConnectionStatus("connected");
        this.syncAllInputs(obs).catch((error) => console.error("[OBS] Failed to sync inputs:", error));
        this.applyScene(obs).catch((error) => console.error("[OBS] Failed to apply scene:", error));
      },
      (error) => {
        // 接続の失敗は ConnectionClosed でも通知されるので、再接続はそちらで予約する
        console.error("[OBS] Failed to connect:", error);
        // URL の形式が不正なときなどは ConnectionClosed が来ないので、ここで未接続にする
        if (obs === this.obs && !(error instanceof OBSWebSocketError)) {
          this.obs = null;
          this.setConnectionStatus("disconnected");
        }
      }
    );
  }

  private handleClosed(obs: OBSWebSocket, error: OBSWebSocketError): void {
    if (obs !== this.obs) return;

    console.warn(`[OBS] Disconnected (code ${error.code})`);
    this.obs = null;
    this.audioInputs.clear();

    if (error.code === CLOSE_AUTHENTICATION_FAILED) {
      this.setConnectionStatus("authFailed");

      return;
    }

    this.setConnectionStatus("disconnected");
    setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
  }

  private async applyScene(obs: OBSWebSocket): Promise<void> {
    if (!this.config || this.desiredScene === null) return;

    await withTimeout(obs.call("SetCurrentProgramScene", { sceneName: this.config.scenes[this.desiredScene] }));
  }

  /**
   * 全入力のミュート状態を読み直し、ミュート指示に合わせる
   */
  private async syncAllInputs(obs: OBSWebSocket): Promise<void> {
    const { inputs } = await withTimeout(obs.call("GetInputList"));
    const uuids = inputs.map((input) => String(input.inputUuid));
    const results = await withTimeout(
      obs.callBatch(
        uuids.map((uuid) => ({ requestType: "GetInputMute", requestId: uuid, requestData: { inputUuid: uuid } }))
      )
    );
    if (obs !== this.obs) return;

    // 失敗した入力（音声を持たない入力など）は対象にしない
    this.audioInputs.clear();
    for (const result of results) {
      if (result.requestType === "GetInputMute" && result.requestStatus.result) {
        this.audioInputs.set(result.requestId, result.responseData.inputMuted);
      }
    }
    this.notify();

    await this.applyMute([...this.audioInputs.keys()]);
  }

  private async handleInputCreated(obs: OBSWebSocket, inputUuid: string): Promise<void> {
    try {
      const { inputMuted } = await withTimeout(obs.call("GetInputMute", { inputUuid }));
      if (obs !== this.obs) return;

      this.audioInputs.set(inputUuid, inputMuted);
      this.notify();
      await this.applyMute([inputUuid]);
    } catch (error) {
      if (error instanceof OBSWebSocketError && error.code === STATUS_INVALID_RESOURCE_STATE) return;
      console.error("[OBS] Failed to handle created input:", error);
    }
  }

  /**
   * 指定した入力のうち、ミュート状態がミュート指示と違う入力だけに SetInputMute を送る
   */
  private async applyMute(inputUuids: string[]): Promise<void> {
    const obs = this.obs;
    if (!obs) {
      throw new Error("OBS に接続していません");
    }

    const inputMuted = this.desiredMuted;
    const targets = inputUuids.filter((uuid) => this.audioInputs.get(uuid) !== inputMuted);
    if (targets.length === 0) return;

    const results = await withTimeout(
      obs.callBatch(
        targets.map((uuid) => ({
          requestType: "SetInputMute",
          requestId: uuid,
          requestData: { inputUuid: uuid, inputMuted },
        }))
      )
    );
    if (obs !== this.obs) return;

    const failures: string[] = [];
    for (const { requestId, requestStatus } of results) {
      if (requestStatus.result) {
        this.audioInputs.set(requestId, inputMuted);
      } else if (
        requestStatus.code === STATUS_RESOURCE_NOT_FOUND ||
        requestStatus.code === STATUS_INVALID_RESOURCE_STATE
      ) {
        this.audioInputs.delete(requestId);
      } else {
        failures.push(`${requestId} (${requestStatus.code}: ${requestStatus.comment})`);
      }
    }
    this.notify();

    if (failures.length > 0) {
      throw new Error(`OBS のミュート切り替えに失敗しました: ${failures.join(", ")}`);
    }
  }

  private setConnectionStatus(connectionStatus: ConnectionStatus): void {
    this.connectionStatus = connectionStatus;
    this.notify();
  }

  private notify(): void {
    const states = [...this.audioInputs.values()];
    const isMuted = isMockMode
      ? this.desiredMuted
      : this.connectionStatus === "connected" && states.length > 0 && states.every(Boolean);

    if (this.snapshot.connectionStatus === this.connectionStatus && this.snapshot.isMuted === isMuted) return;

    this.snapshot = { connectionStatus: this.connectionStatus, isMuted };
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const obsClient = new ObsClient();
