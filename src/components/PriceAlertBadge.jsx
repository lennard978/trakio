import React from "react";

export default function PriceAlertBadge({ alert }) {
  if (!alert) return null;

  return (
    <div
      className="
        mt-2 text-xs px-2 py-1 rounded-lg
        bg-red-500/15 text-red-700
        dark:text-red-300 border border-red-500/30
      "
    >
      ⚠️ Price increased: {alert.oldPrice} → {alert.newPrice} (+{alert.percent}%)
    </div>
  );
}
