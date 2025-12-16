import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import {
  BrowserRouter,
  HashRouter
} from "react-router-dom";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./hooks/useAuth";
import { PremiumProvider } from "./context/PremiumContext";
import "./i18n.js";

// Use BrowserRouter ALWAYS on Vercel.
// HashRouter was only needed for GitHub Pages (you no longer need it).
const Router = BrowserRouter;
import { CurrencyProvider } from "./context/CurrencyContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
  </React.StrictMode>
);

// REMOVE ALL CUSTOM SERVICE WORKER LOGIC.
// VitePWA injects its own service worker automatically.
