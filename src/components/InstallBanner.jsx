import React from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useTranslation } from "react-i18next";
const InstallBanner = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const { t } = useTranslation();
  if (!isInstallable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 p-1 bg-blue-600 text-white text-center shadow-lg z-50">
      <span className="text-xs">{t('install_app' || "Install this app for a better experience")}</span>
      <button
        className="ml-4 px-1 py-1 bg-white text-xs text-blue-600 rounded"
        onClick={promptInstall}
      >
        {t("install") || "Install"}
      </button>
    </div>
  );
};

export default InstallBanner;
