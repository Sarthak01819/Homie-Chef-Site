import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      // Auth routes
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      // Admin routes
      "/admin": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      // Orders (admin uses this too)
      "/orders": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      // Any future API routes (safe default)
      "/meals": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      "/payments": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
