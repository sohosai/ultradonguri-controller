import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { donguriServerPlugin } from "./server/donguriServerPlugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), donguriServerPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
