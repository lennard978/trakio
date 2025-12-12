import React, { useMemo } from "react";
import { computeNextRenewal } from "../utils/renewal";

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
}

export default function UpcomingPayments({
  subscriptions,
  currency,
  rates,
  convert,
  daysAhead = 7,
}) {
  const upcoming = useMemo(() => {
    const now = new Date();

    return subscriptions
      .map((s) => {
        const next = computeNextRenewal(s.datePaid, s.frequency);
        if (!next) return null;

        const diff = daysUntil(next);
        if (diff < 0 || diff > daysAhead) return null;

        return {
          ...s,
          nextDate: next,
          daysLeft: diff,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.nextDate - b.nextDate);
  }, [subscriptions, daysAhead]);

  if (upcoming.length === 0) return null;

  return (
    <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm
      p-4 mb-4
    ">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
        Upcoming payments
      </h3>

      <ul className="space-y-2">
        {upcoming.map((s) => {
          const price =
            rates && convert
              ? convert(s.price, s.currency || "EUR", currency, rates)
              : s.price;

          let label = "";
          if (s.daysLeft === 0) label = "Today";
          else if (s.daysLeft === 1) label = "Tomorrow";
          else label = `In ${s.daysLeft} days`;

          return (
            <li
              key={s.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-900 dark:text-white font-medium">
                {s.name}
              </span>

              <span className="text-gray-600 dark:text-gray-400">
                {currency} {price.toFixed(2)} · {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
