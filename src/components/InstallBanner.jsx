import React, { useState, useEffect } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useTranslation } from "react-i18next";

const InstallBanner = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const { t } = useTranslation();

  // ✅ track dismiss state in React state
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("installDismissed") === "true";
  });

  // ✅ sync to localStorage when dismissed changes
  useEffect(() => {
    localStorage.setItem("installDismissed", dismissed ? "true" : "false");
  }, [dismissed]);

  if (!isInstallable || dismissed) return null;

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label={t("install_app") || "Install this app for a better experience"}
      className="fixed top-0 left-0 right-0 p-1 bg-orange-500 text-black text-center shadow-lg z-50 animate-slide-down"
    >
      <span className="text-xs font-medium">
        {t("install_app") || "Install this app for a better experience"}
      </span>
      <button
        type="button"
        aria-label={t("install") || "Install app"}
        className="ml-4 px-4 py-1 bg-black text-xs text-orange-600 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition"
        onClick={promptInstall}
      >
        {t("install") || "Install"}
      </button>

      {/* ✅ Now this instantly hides the banner */}
      <button
        type="button"
        aria-label={t("dismiss") || "Dismiss"}
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/70 hover:text-black"
      >
        ✕
      </button>
    </div>
  );
};

InstallBanner.propTypes = {};

export default InstallBanner;
