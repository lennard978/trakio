import React from "react";
import ReactDOM from "react-dom/client";

// App
import App from "./App.jsx";
import "./index.css";
import "./i18n.js";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";

import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./context/AppProviders";
import { registerSW } from "virtual:pwa-register";
import HardErrorBoundary
  from "./components/HardErrorBoundary.jsx";

registerSW({ immediate: true });
ReactDOM.createRoot(document.getElementById("root")).render(
  <HardErrorBoundary>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </HardErrorBoundary>
);
