import { getPerformances } from '../http/endpoints';

const STORAGE_KEY = 'ws_last_offset';
const RECONNECT_INTERVAL = 1000; // 1 second

export interface WSEvent {
  type: 'performance' | 'music' | 'conversion/start' | 'conversion/cm-mode';
  data: unknown;
  offset: number;
}

type EventHandler = (data: unknown) => void;

/**
 * WebSocket client for real-time event streaming
 */
class StreamClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: number | null = null;
  private shouldReconnect = false;
  private wsUrl: string;

  constructor() {
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://local-mock/stream';
  }

  /**
   * Connect to WebSocket server with lastOffset
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.shouldReconnect = true;
    const lastOffset = this.getLastOffset();
    const url = `${this.wsUrl}?lastOffset=${lastOffset}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        if (this.reconnectTimer !== null) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const wsEvent: WSEvent = JSON.parse(event.data);
          this.handleEvent(wsEvent);
          this.saveLastOffset(wsEvent.offset);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected');
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[WS] Connection failed:', error);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Disconnect from WebSocket server
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
      console.log('[WS] Catch-up complete:', data);
    } catch (error) {
      console.error('[WS] Catch-up failed:', error);
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

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      return;
    }
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[WS] Reconnecting...');
      this.connect();
    }, RECONNECT_INTERVAL);
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
