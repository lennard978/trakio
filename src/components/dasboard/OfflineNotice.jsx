import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FiWifiOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function OfflineNotice({ fullScreen = true }) {
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`
            ${fullScreen ? "fixed inset-0" : "mt-6"}
            flex flex-col items-center justify-center text-center px-4
            bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-lg
            z-50 rounded-xl shadow-lg
          `}
        >
          <FiWifiOff className="text-6xl text-orange-500 mb-4 animate-pulse" aria-hidden="true" />

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t("offline_title", "You’re offline")}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm">
            {t(
              "offline_message",
              "Some features may be unavailable until you reconnect to the internet."
            )}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all shadow-md"
          >
            {t("retry_button", "Retry")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

OfflineNotice.propTypes = {
  /** Whether the component should take up the full screen */
  fullScreen: PropTypes.bool,
};
