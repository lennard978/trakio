import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { computeNextRenewal } from "../utils/renewal";
import { useTranslation } from "react-i18next";

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return Math.ceil((d - today) / 86400000);
}

function formatDateLabel(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpcomingPayments({
  subscriptions,
  currency,
  rates,
  convert,
  daysAhead = 7,
}) {
  const { t } = useTranslation();

  const upcoming = useMemo(() => {
    if (!Array.isArray(subscriptions)) return [];

    return subscriptions
      .map((s) => {
        if (!Array.isArray(s.payments) || s.payments.length === 0) return null;
        const next = computeNextRenewal(s.payments, s.frequency);
        if (!next || isNaN(new Date(next).getTime())) return null;

        const diff = daysUntil(next);
        if (diff < 0 || diff > daysAhead) return null;

        return { ...s, nextDate: next, daysLeft: diff };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
  }, [subscriptions, daysAhead]);

  if (upcoming.length === 0) {
    return (
      <div className="p-5 text-center text-sm text-gray-500 dark:text-gray-400 italic">
        {t("no_upcoming_payments") || "No upcoming payments"}
      </div>
    );
  }

  return (
    <div
      className="
        p-5 rounded-2xl
        bg-white/90 dark:bg-black/30
        border border-gray-300/60 dark:border-white/10
        backdrop-blur-xl
        shadow-[0_8px_25px_rgba(0,0,0,0.08)]
        dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
        transition-all mb-2
      "
    >
      <h3
        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center"
        aria-label={t("upcoming_payments")}
      >
        {t("upcoming_payments") || "Upcoming payments"}
      </h3>

      <ul className="space-y-2">
        {upcoming.map((s) => {
          const price =
            rates && convert
              ? convert(s.price, s.currency || "EUR", currency, rates)
              : s.price;

          const safePrice = Number(price) || 0;

          let label;
          if (s.daysLeft === 0) label = t("today") || "Today";
          else if (s.daysLeft === 1) label = t("tomorrow") || "Tomorrow";
          else label = t("in_days", { count: s.daysLeft }) || `In ${s.daysLeft} days`;

          const urgencyColor =
            s.daysLeft <= 1
              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
              : s.daysLeft <= 3
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

          return (
            <li
              key={s.id}
              className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-white font-medium">
                  {s.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateLabel(s.nextDate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {currency} {safePrice.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${urgencyColor}`}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

UpcomingPayments.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      frequency: PropTypes.string,
      currency: PropTypes.string,
      payments: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string.isRequired,
          amount: PropTypes.number,
        })
      ),
    })
  ).isRequired,
  currency: PropTypes.string.isRequired,
  rates: PropTypes.object,
  convert: PropTypes.func,
  daysAhead: PropTypes.number,
};
