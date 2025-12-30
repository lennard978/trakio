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

import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./hooks/useAuth";
import { PremiumProvider } from "./context/PremiumContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";

import "./i18n.js";
const Router = BrowserRouter;

import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

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
