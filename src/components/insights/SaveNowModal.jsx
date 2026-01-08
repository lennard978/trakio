import React from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

/**
 * SaveNowModal
 * --------------------------------------------------
 * Modal shown when user chooses "Save now" from
 * overlapping subscription insights.
 *
 * Responsibilities:
 * - Render modal UI
 * - Handle close + action buttons
 *
 * Responsibilities NOT included:
 * - Deciding WHEN to open
 * - Business logic
 * - Premium checks
 *
 * This component assumes a DOM node:
 *   <div id="modal-root"></div>
 */
export default function SaveNowModal({
  open,
  onClose,
  provider,
  message,
  t,
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center 
                 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl 
                   bg-white dark:bg-[#0e1420] 
                   border border-gray-300 dark:border-gray-800 
                   shadow-2xl p-6 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t("overlaps.save_now", "Save now")}
        </h3>

        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full 
                       bg-gray-200 dark:bg-gray-800 
                       text-gray-800 dark:text-gray-100 
                       text-sm"
          >
            {t("common.close", "Close")}
          </button>

          {provider?.cancelUrl ? (
            <a
              href={provider.cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full 
                         bg-[#ED7014] text-white 
                         text-sm font-medium 
                         hover:opacity-90"
            >
              {t("overlaps.open_provider", "Open {{provider}}")
                .replace("{{provider}}", provider.name)}
            </a>
          ) : (
            <button
              onClick={() => {
                onClose();
                window.location.href = "/settings";
              }}
              className="px-5 py-2 rounded-full 
                         bg-[#ED7014] text-white 
                         text-sm font-medium 
                         hover:opacity-90"
            >
              {t(
                "overlaps.manage_subscriptions",
                "Manage subscriptions"
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

SaveNowModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  provider: PropTypes.shape({
    name: PropTypes.string,
    cancelUrl: PropTypes.string,
  }),
  message: PropTypes.string,
  t: PropTypes.func.isRequired,
};
