import React from "react";

/**
 * Props:
 * - items: [{ name, price, currency }]
 * - recommendedName: string (service to keep)
 */
export default function SubscriptionComparisonBars({
  items = [],
  recommendedName,
}) {
  if (!items.length) return null;

  const maxPrice = Math.max(...items.map((i) => i.price || 0)) || 1;

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => {
        const widthPercent = (item.price / maxPrice) * 100;
        const isRecommended = item.name === recommendedName;

        return (
          <div key={item.name} className="space-y-1">
            {/* Label row */}
            <div className="flex justify-between text-xs">
              <span className="text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {item.price.toFixed(2)} {item.currency}
                {isRecommended && (
                  <span className="ml-1 text-green-600 font-medium">✓</span>
                )}
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${isRecommended
                    ? "bg-green-500"
                    : "bg-orange-400"
                  }`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
