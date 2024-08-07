import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://lana-api.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ""),
      },
      "/img": {
        target: "https://lana-api.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ""),
      },
      "/videos": {
        target: "https://lana-api.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ""),
      },
      "/verificationFiles": {
        target: "https://lana-api.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ""),
      },
      "/socket": {
        target: "https://lana-api.onrender.com",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [react()],
});
