const OFFSET_STORAGE_KEY = "ws_last_offset";
const EPOCH_STORAGE_KEY = "ws_epoch";
const RELAY_PATH = "/burari/ws";
const RECONNECT_DELAY_MS = 2000;

export interface WSEvent {
  type:
    | "/performance/start"
    | "/performance/music"
    | "/conversion/start"
    | "/conversion/cm-mode"
    | "/display-copyright"
    | "/force_mute"
    | "/burari/play"
    | "/burari/stop"
    | "/burari/ended"
    | "/relay/hello";
  data: unknown;
  offset: number;
}

type EventHandler = (data: unknown) => void;

/**
 * Vite サーバー上の WebSocket リレー（/burari/ws）に接続するクライアント。
 * Controller / Viewer の双方が受信・送信の両方に使う。
 */
class StreamClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private sendQueue: string[] = [];
  private shouldReconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connect to the relay server (no-op if already connected)
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;

    const params = new URLSearchParams({ lastOffset: String(this.getLastOffset()) });
    const epoch = localStorage.getItem(EPOCH_STORAGE_KEY);
    if (epoch) {
      params.set("epoch", epoch);
    }
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${location.host}${RELAY_PATH}?${params}`;

    console.log("[WS] Connecting to:", url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[WS] Connected successfully");
      const queued = this.sendQueue;
      this.sendQueue = [];
      for (const payload of queued) {
        this.ws?.send(payload);
      }
    };

    this.ws.onmessage = (event) => {
      let wsEvent: WSEvent;
      try {
        wsEvent = JSON.parse(event.data);
      } catch (error) {
        console.error("[WS] Failed to parse message:", error);

        return;
      }

      if (wsEvent.type === "/relay/hello") {
        const payload = wsEvent.data as { epoch: string };
        localStorage.setItem(EPOCH_STORAGE_KEY, payload.epoch);
        this.saveLastOffset(wsEvent.offset);

        return;
      }

      this.handleEvent(wsEvent);
      this.saveLastOffset(wsEvent.offset);
    };

    this.ws.onerror = (error) => {
      console.error("[WS] Error:", error);
    };

    this.ws.onclose = () => {
      console.log("[WS] Disconnected");
      this.ws = null;
      if (this.shouldReconnect && this.reconnectTimer === null) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, RECONNECT_DELAY_MS);
      }
    };
  }

  /**
   * Disconnect and stop reconnecting
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send an event to the relay server.
   * 未接続の場合は接続を開始し、接続完了までキューイングする。
   */
  send(type: WSEvent["type"], data: unknown): void {
    const payload = JSON.stringify({ type, data });
    this.connect();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      this.sendQueue.push(payload);
    }
  }

  /**
   * Register event handler
   * @returns Unsubscribe function
   */
  on(type: WSEvent["type"], handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  private handleEvent(event: WSEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event.data);
        } catch (error) {
          console.error(`[WS] Handler error for ${event.type}:`, error);
        }
      });
    }
  }

  private getLastOffset(): number {
    const stored = localStorage.getItem(OFFSET_STORAGE_KEY);

    return stored ? parseInt(stored, 10) : 0;
  }

  private saveLastOffset(offset: number): void {
    localStorage.setItem(OFFSET_STORAGE_KEY, String(offset));
  }
}

// Export singleton instance
export const streamClient = new StreamClient();
