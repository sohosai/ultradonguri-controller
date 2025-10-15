/**
 * Event log with offset for WebSocket broadcasting
 */

export interface OutboxEvent {
  type: string;
  data: unknown;
  offset: number;
}

class Outbox {
  private events: OutboxEvent[] = [];
  private currentOffset = 0;

  /**
   * Append new event to outbox
   */
  append(event: { type: string; data: unknown }): OutboxEvent {
    this.currentOffset++;
    const outboxEvent: OutboxEvent = {
      type: event.type,
      data: event.data,
      offset: this.currentOffset,
    };
    this.events.push(outboxEvent);

    return outboxEvent;
  }

  /**
   * Get events after specified offset
   */
  getAfter(offset: number): OutboxEvent[] {
    return this.events.filter((e) => e.offset > offset);
  }

  /**
   * Get all events
   */
  getAll(): OutboxEvent[] {
    return [...this.events];
  }

  /**
   * Get current offset
   */
  getCurrentOffset(): number {
    return this.currentOffset;
  }
}

// Export singleton instance
export const outbox = new Outbox();
