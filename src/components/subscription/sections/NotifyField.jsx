import React from "react";
import PropTypes from "prop-types";

/**
 * NotifyField
 * - Renewal notification toggle
 *
 * PURE UI COMPONENT
 */
export default function NotifyField({ notify, setNotify, t }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={!!notify}
        onChange={(e) => setNotify(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label className="text-sm text-gray-700 dark:text-gray-300">
        {t("settings_notifications_info")}
      </label>
    </div>
  );
}

NotifyField.propTypes = {
  notify: PropTypes.bool,
  setNotify: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

NotifyField.defaultProps = {
  notify: false
};
