import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api/* to the FastAPI backend so the frontend can use a
// relative `/api` prefix and not worry about CORS in development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    proxy: {
      "/api": {
        target: "http://localhost:8005",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
