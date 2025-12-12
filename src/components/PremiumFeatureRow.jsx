import React from "react";

export default function PremiumFeatureRow({
  title,
  free = false,
  premium = false,
}) {
  return (
    <div className="flex justify-between items-center py-2 text-sm">
      <span>{title}</span>

      <div className="flex gap-4">
        <span className={free ? "text-green-500" : "text-gray-400"}>
          {free ? "✓" : "—"}
        </span>
        <span className={premium ? "text-green-500" : "text-gray-400"}>
          {premium ? "✓" : "—"}
        </span>
      </div>
    </div>
  );
}
