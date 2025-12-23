import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";

import {
  BrowserRouter,
  HashRouter
} from "react-router-dom";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./hooks/useAuth";
import { PremiumProvider } from "./context/PremiumContext";
import "./i18n.js";
import { ThemeProvider } from "./context/ThemeContext";

// Use BrowserRouter ALWAYS on Vercel.
// HashRouter was only needed for GitHub Pages (you no longer need it).
const Router = BrowserRouter;
import { CurrencyProvider } from "./context/CurrencyContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>

      <ToastProvider>
        <AuthProvider>
          <PremiumProvider>
            <Router >
              <CurrencyProvider>
                <App />
              </CurrencyProvider>
            </Router>
          </PremiumProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>

  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}

// REMOVE ALL CUSTOM SERVICE WORKER LOGIC.
// VitePWA injects its own service worker automatically.
