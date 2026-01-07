import { useEffect, useState } from "react";

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const isSupported = "BeforeInstallPromptEvent" in window;

  useEffect(() => {
    if (!isSupported) {
      console.warn("PWA install prompt not supported in this browser.");
      return;
    }

    const handler = (e) => {
      e.preventDefault(); // Prevent default automatic prompt
      if (!deferredPrompt) {
        setDeferredPrompt(e);
        setIsInstallable(true);
        console.log("PWA install prompt is available.");
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      console.log("✅ App successfully installed!");
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [isSupported, deferredPrompt]);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn("Install prompt not available.");
      return;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log("User choice:", result.outcome);

    setDeferredPrompt(null);
    setIsInstallable(false);
    return result;
  };

  return { isInstallable, promptInstall, isSupported };
};
