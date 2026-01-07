import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { getForgottenSubscriptions } from "../utils/forgottenSubscriptions";
import { useTranslation } from "react-i18next";

export default function ForgottenSubscriptions({ subscriptions }) {
  const { t } = useTranslation();

  const forgotten = useMemo(() => {
    const result = getForgottenSubscriptions(subscriptions);
    return Array.isArray(result) ? result : [];
  }, [subscriptions]);

  if (forgotten.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 italic mb-4">
        {t("no_forgotten_subs") || "No forgotten subscriptions — great job!"}
      </div>
    );
  }

  return (
    <div
      className="
        bg-yellow-500/5 dark:bg-yellow-500/10
        border border-yellow-500/20
        rounded-xl p-4 mb-4
      "
      aria-label={t("forgoten_subs")}
    >
      <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-3 text-center">
        ⚠️ {t("forgoten_subs") || "Subscriptions you may have forgotten"}
      </h3>

      <ul className="space-y-2 text-sm">
        {forgotten.map((s) => (
          <li key={s.id} className="flex justify-between items-center">
            <span className="font-medium">{s.name}</span>

            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              {t("last_paid_subs", { days: s.overdueDays }) ||
                `Last paid ${s.overdueDays} days ago`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ForgottenSubscriptions.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      overdueDays: PropTypes.number,
    })
  ).isRequired,
};
