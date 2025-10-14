import { http, HttpResponse } from 'msw';
import { outbox } from './outbox';

/**
 * MSW HTTP request handlers
 */
export const handlers = [
  // GET /performances - Return public/mock.json
  http.get('/performances', async () => {
    try {
      const response = await fetch('/mock.json');
      const data = await response.json();
      return HttpResponse.json(data);
    } catch (error) {
      console.error('[MSW] Failed to load mock.json:', error);
      return HttpResponse.json({ error: 'Failed to load mock data' }, { status: 500 });
    }
  }),

  // POST /performance/start
  http.post('/performance/start', async ({ request }) => {
    const body = await request.json();
    const event = outbox.append({
      type: 'performance',
      data: body,
    });

    // Broadcast via CustomEvent
    window.dispatchEvent(
      new CustomEvent('mock-ws-broadcast', {
        detail: event,
      }),
    );

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /performance/music
  http.post('/performance/music', async ({ request }) => {
    const body = await request.json();
    const event = outbox.append({
      type: 'music',
      data: body,
    });

    console.log('[MSW Handler] Broadcasting event:', event);
    window.dispatchEvent(
      new CustomEvent('mock-ws-broadcast', {
        detail: event,
      }),
    );

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /conversion/start
  http.post('/conversion/start', async ({ request }) => {
    const body = await request.json();
    const event = outbox.append({
      type: 'conversion/start',
      data: body,
    });

    window.dispatchEvent(
      new CustomEvent('mock-ws-broadcast', {
        detail: event,
      }),
    );

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /conversion/cm-mode
  http.post('/conversion/cm-mode', async ({ request }) => {
    const body = await request.json();
    const event = outbox.append({
      type: 'conversion/cm-mode',
      data: body,
    });

    window.dispatchEvent(
      new CustomEvent('mock-ws-broadcast', {
        detail: event,
      }),
    );

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /force_mute
  http.post('/force_mute', async ({ request }) => {
    const body = await request.json();
    const event = outbox.append({
      type: 'force_mute',
      data: body,
    });

    window.dispatchEvent(
      new CustomEvent('mock-ws-broadcast', {
        detail: event,
      }),
    );

    return new HttpResponse(null, { status: 204 });
  }),
];
