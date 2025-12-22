// src/components/UpcomingPayments.jsx
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
    return subscriptions
      .map((s) => {
        if (!Array.isArray(s.payments) || s.payments.length === 0) {
          return null;
        }

        const next = computeNextRenewal(s.payments, s.frequency);
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
