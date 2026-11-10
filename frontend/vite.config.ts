import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("recharts") ||
              id.includes("d3-scale") ||
              id.includes("d3-shape") ||
              id.includes("d3-path") ||
              id.includes("victory-vendor")
            ) {
              return "vendor-charts";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("leaflet")) {
              return "vendor-maps";
            }
            if (
              id.includes("@radix-ui") ||
              id.includes("@hookform") ||
              id.includes("cmdk") ||
              id.includes("vaul")
            ) {
              return "vendor-ui";
            }
            if (id.includes("react-router-dom") || id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react";
            }
          }
          if (id.includes("university-data")) {
            return "data-university";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    // API proxy — forwards /api and /uploads requests to the backend dev server.
    // Backend must be running on port 5001 (cd backend && npm run dev).
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
