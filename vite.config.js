import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Trakio",
        short_name: "Trakio",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  metaTags: [
    { name: "description", content: "Track your subscriptions effortlessly with Trakio." },
    { property: "og:title", content: "Trakio — Subscription Tracker" },
    { property: "og:description", content: "Track your subscriptions effortlessly with Trakio." },
    { property: "og:image", content: "/og-image.png" },
    { property: "og:type", content: "website" },
    { property: "twitter:card", content: "summary_large_image" }
  ]

});
