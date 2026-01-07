import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export default function AppUpdateBanner({ onUpdate }) {
  const { t } = useTranslation();

  // ✅ local state to allow dismissing the banner
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="update-banner"
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="
            fixed bottom-[6rem] sm:bottom-[5rem]
            left-1/2 -translate-x-1/2
            z-50
            pb-[env(safe-area-inset-bottom)]
          "
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#ED7014] text-[#fff8f0] shadow-lg">
            {/* Message */}
            <span className="text-sm font-medium">
              {t("new_version") || "New version available"}
            </span>

            {/* Update Button */}
            <button
              onClick={onUpdate}
              aria-label={t("update_app") || "Update app to new version"}
              className="text-xs px-3 py-1 rounded-lg bg-white text-[#ED7014] font-semibold hover:bg-[#fff4e8] transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#ED7014]"
            >
              {t("update_app") || "Update"}
            </button>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label={t("dismiss") || "Dismiss update notification"}
              className="text-xs px-2 py-1 rounded-lg bg-transparent border border-white text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#ED7014]"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

AppUpdateBanner.propTypes = {
  onUpdate: PropTypes.func.isRequired,
};
