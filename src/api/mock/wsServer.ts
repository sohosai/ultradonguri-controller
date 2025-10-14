import { Server, WebSocket } from 'mock-socket';
import { outbox, type OutboxEvent } from './outbox';

/**
 * Mock WebSocket server
 */
class MockWSServer {
  private server: Server | null = null;
  private clients = new Map<WebSocket, number>(); // WebSocket -> lastOffset

  start(): void {
    if (this.server) {
      console.warn('[Mock WS] Server already running');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://local-mock/stream';
    this.server = new Server(wsUrl);

    this.server.on('connection', (socket) => {
      // Parse lastOffset from query string
      const url = new URL(socket.url);
      const lastOffset = parseInt(url.searchParams.get('lastOffset') || '0', 10);

      console.log('[Mock WS] Client connected, lastOffset:', lastOffset);
      this.clients.set(socket, lastOffset);

      // Send missed events
      const missedEvents = outbox.getAfter(lastOffset);
      missedEvents.forEach((event) => {
        socket.send(JSON.stringify(event));
      });

      socket.on('close', () => {
        console.log('[Mock WS] Client disconnected');
        this.clients.delete(socket);
      });
    });

    // Listen for broadcast events from HTTP handlers
    window.addEventListener('mock-ws-broadcast', this.handleBroadcast);

    console.log('[Mock WS] Server started at', wsUrl);
  }

  stop(): void {
    if (!this.server) {
      return;
    }

    window.removeEventListener('mock-ws-broadcast', this.handleBroadcast);
    this.server.close();
    this.server = null;
    this.clients.clear();
    console.log('[Mock WS] Server stopped');
  }

  private handleBroadcast = (event: Event): void => {
    const customEvent = event as CustomEvent<OutboxEvent>;
    const outboxEvent = customEvent.detail;

    // Broadcast to all connected clients
    this.clients.forEach((lastOffset, socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(outboxEvent));
        // Update client's lastOffset
        this.clients.set(socket, outboxEvent.offset);
      }
    });
  };
}

// Export singleton instance
export const mockWSServer = new MockWSServer();
