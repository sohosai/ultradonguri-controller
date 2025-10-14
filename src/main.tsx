import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./styles/global.css";
import "./styles/colors.css";
import "./styles/typography.css";
import "./styles/reset.css";

// Initialize mock services if in mock mode
async function initializeMocks() {
  const apiMode = import.meta.env.VITE_API_MODE || 'mock';

  if (apiMode === 'mock') {
    const { startMSW } = await import('./api/mock/msw');
    const { mockWSServer } = await import('./api/mock/wsServer');

    await startMSW();
    mockWSServer.start();

    console.log('[Mock] Mock services started');
  } else {
    console.log('[Mock] Running in real mode');
  }
}

// Start the application
initializeMocks().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
