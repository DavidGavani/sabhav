import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    // Allow ngrok / tunnels while sharing the local preview
    allowedHosts: true,
  },
});

