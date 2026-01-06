import React from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import { getNormalizedPayments } from "../../utils/payments";

/**
 * Shows a short, reliable summary of price changes per subscription.
 * Designed for sparse data (0–N payments).
 */
export default function PriceChangeSummary({
  subscriptions = [],
  currency = "EUR",
}) {
  if (!subscriptions.length) return null;

  const lines = [];

  subscriptions.forEach((sub) => {
    const payments = getNormalizedPayments(sub)
      .filter(p => typeof p.amount === "number")
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (payments.length < 2) {
      lines.push({
        key: sub.name,
        text: `${sub.name} has not changed price`,
        type: "neutral",
      });
      return;
    }

    const first = payments[0];
    const last = payments[payments.length - 1];

    if (last.amount > first.amount) {
      const diff = (last.amount - first.amount).toFixed(2);
      const month = new Date(last.date).toLocaleString("default", {
        month: "short",
      });

      lines.push({
        key: sub.name,
        text: `${sub.name} increased from ${first.amount.toFixed(
          2
        )} → ${last.amount.toFixed(2)} ${currency} in ${month}`,
        type: "increase",
        diff,
      });
    } else {
      lines.push({
        key: sub.name,
        text: `${sub.name} has remained stable`,
        type: "neutral",
      });
    }
  });

  if (!lines.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-gray-300 dark:border-gray-800/70 bg-gray-50 dark:bg-[#0e1420] p-3">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Price history (summary)
      </div>

      <div className="space-y-1 text-xs">
        {lines.map((l) => (
          <div
            key={l.key}
            className={`flex items-center gap-1 ${l.type === "increase"
              ? "text-orange-600 dark:text-orange-400"
              : "text-gray-600 dark:text-gray-400"
              }`}
          >
            {l.type === "increase" && (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            )}
            <span>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
