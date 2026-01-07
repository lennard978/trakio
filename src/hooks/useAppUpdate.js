import { useEffect, useState } from "react";

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reg;
    let onUpdateFound;

    const handleAppInstalled = () => {
      console.log("✅ App successfully installed or updated!");
      setWaitingWorker(null);
      setUpdateAvailable(false);
    };

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      reg = registration;

      // Handle already waiting worker (i.e., update already downloaded)
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }

      // Handle new updates found
      onUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
            console.log("[SW] Update available and ready.");
          }
        });
      };

      registration.addEventListener("updatefound", onUpdateFound);
    });

    // Listen for installed event
    window.addEventListener("appinstalled", handleAppInstalled);

    // Periodic update checks (every 6 hours)
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }, 1000 * 60 * 60 * 6);

    return () => {
      if (reg && onUpdateFound) reg.removeEventListener("updatefound", onUpdateFound);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(interval);
    };
  }, []);

  // Manually apply the waiting update
  const applyUpdate = () => {
    if (!waitingWorker) {
      console.warn("[SW] No waiting worker found.");
      return;
    }

    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true } // ✅ ensures single reload
    );
  };

  // Automatically apply update without banner
  const autoUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  return { updateAvailable, applyUpdate, autoUpdate };
}
