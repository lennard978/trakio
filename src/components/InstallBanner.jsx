import React from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const InstallBanner = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-blue-600 text-white text-center shadow-lg z-50">
      <span>Install this app for a better experience</span>
      <button
        className="ml-4 px-3 py-1 bg-white text-blue-600 rounded"
        onClick={promptInstall}
      >
        Install
      </button>
    </div>
  );
};

export default InstallBanner;
