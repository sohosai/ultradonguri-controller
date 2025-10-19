import { getPerformances } from "../http/endpoints";

const STORAGE_KEY = "ws_last_offset";

export interface WSEvent {
  type: "performance" | "music" | "conversion/start" | "conversion/cm-mode" | "display-copyright";
  data: unknown;
  offset: number;
}

type EventHandler = (data: unknown) => void;

/**
 * WebSocket client for real-time event streaming
 * In mock mode, uses BroadcastChannel for cross-tab communication
 */
class StreamClient {
  private ws: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private wsUrl: string;
  private isMockMode: boolean;

  constructor() {
    this.wsUrl = import.meta.env.VITE_WS_URL || "ws://local-mock/stream";
    this.isMockMode = (import.meta.env.VITE_API_MODE || "mock") === "mock";
  }

  /**
   * Connect to WebSocket server or BroadcastChannel
   */
  connect(): void {
    if (this.isMockMode) {
      // Use BroadcastChannel in mock mode
      if (this.channel) {
        console.log("[WS] Already connected to BroadcastChannel");

        return;
      }

      this.channel = new BroadcastChannel("mock-ws-events");
      this.channel.onmessage = (event) => {
        console.log("[WS] Received message from BroadcastChannel:", event.data);
        const wsEvent = event.data as WSEvent;
        this.handleEvent(wsEvent);
        this.saveLastOffset(wsEvent.offset);
      };

      console.log("[WS] Connected to BroadcastChannel");
    } else {
      // Use real WebSocket in real mode
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log("[WS] Already connected");

        return;
      }

      const lastOffset = this.getLastOffset();
      const url = `${this.wsUrl}?lastOffset=${lastOffset}`;

      console.log("[WS] Connecting to:", url);

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log("[WS] Connected successfully");
        };

        this.ws.onmessage = (event) => {
          console.log("[WS] Received message:", event.data);
          try {
            const wsEvent: WSEvent = JSON.parse(event.data);
            this.handleEvent(wsEvent);
            this.saveLastOffset(wsEvent.offset);
          } catch (error) {
            console.error("[WS] Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[WS] Error:", error);
        };

        this.ws.onclose = () => {
          console.log("[WS] Disconnected");
          this.ws = null;
        };
      } catch (error) {
        console.error("[WS] Connection failed:", error);
      }
    }
  }

  /**
   * Disconnect from WebSocket server or BroadcastChannel
   */
  disconnect(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Register event handler
   * @returns Unsubscribe function
   */
  on(type: string, handler: EventHandler): () => void {
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

  /**
   * Catch up on missed events (minimal implementation for mock mode)
   */
  async catchUp(): Promise<void> {
    try {
      // In mock mode, fetch initial state from GET /performances
      const data = await getPerformances();
      console.log("[WS] Catch-up complete:", data);
    } catch (error) {
      console.error("[WS] Catch-up failed:", error);
    }
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
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? parseInt(stored, 10) : 0;
  }

  private saveLastOffset(offset: number): void {
    localStorage.setItem(STORAGE_KEY, String(offset));
  }
}

// Export singleton instance
export const streamClient = new StreamClient();
