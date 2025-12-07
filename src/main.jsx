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

// GitHub Pages requires HashRouter
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <PremiumProvider>
          <Router>
            <App />
          </Router>
        </PremiumProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(
        import.meta.env.PROD
          ? "/subscription-tracker/serviceWorker.js"
          : "/serviceWorker.js"
      )
      .then((reg) => console.log("SW registered", reg))
      .catch((err) => console.error("SW registration failed", err));
  });
}

// SW Update notifications
if (import.meta.env.PROD) {
  import("./context/ToastContext").then(({ useToast }) => {
    const toastRoot = document.createElement("div");
    toastRoot.id = "toast-hook";
    document.body.appendChild(toastRoot);

    const Temp = () => {
      const { showToast } = useToast();
      React.useEffect(() => {
        registerSWUpdateListener(showToast);
      }, []);
      return null;
    };

    ReactDOM.createRoot(toastRoot).render(
      <ToastProvider>
        <Temp />
      </ToastProvider>
    );
  });
}
