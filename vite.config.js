import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => ({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Subscription Tracker",
        short_name: "Tracker",
        start_url: "/subscription-tracker/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          { src: "/subscription-tracker/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/subscription-tracker/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
}));
