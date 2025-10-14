import type { OutboxEvent } from './outbox';

/**
 * Mock WebSocket server using BroadcastChannel
 */
class MockWSServer {
  private channel: BroadcastChannel | null = null;

  start(): void {
    if (this.channel) {
      console.warn('[Mock WS] Server already running');
      return;
    }

    // Create BroadcastChannel for cross-tab communication
    this.channel = new BroadcastChannel('mock-ws-events');

    // Listen for broadcast events from HTTP handlers
    window.addEventListener('mock-ws-broadcast', this.handleBroadcast);

    console.log('[Mock WS] Server started with BroadcastChannel');
  }

  stop(): void {
    if (!this.channel) {
      return;
    }

    window.removeEventListener('mock-ws-broadcast', this.handleBroadcast);
    this.channel.close();
    this.channel = null;
    console.log('[Mock WS] Server stopped');
  }

  private handleBroadcast = (event: Event): void => {
    const customEvent = event as CustomEvent<OutboxEvent>;
    const outboxEvent = customEvent.detail;

    console.log('[Mock WS] Broadcasting to all tabs:', outboxEvent);

    // Broadcast to all tabs via BroadcastChannel
    if (this.channel) {
      this.channel.postMessage(outboxEvent);
    }
  };
}

// Export singleton instance
export const mockWSServer = new MockWSServer();
