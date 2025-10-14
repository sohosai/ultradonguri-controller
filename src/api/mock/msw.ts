import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW worker setup
 */
export const worker = setupWorker(...handlers);

/**
 * Start MSW worker
 */
export async function startMSW(): Promise<void> {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // Allow unhandled requests to pass through
      quiet: false, // Log MSW activity
    });
    console.log('[MSW] Service worker started');
  } catch (error) {
    console.error('[MSW] Failed to start service worker:', error);
  }
}
