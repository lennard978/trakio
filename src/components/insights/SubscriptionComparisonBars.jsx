import React, { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

/**
 * Props:
 * - items: [{ name, price, currency }]
 * - keepName: string (recommended / cheapest)
 */
export default function SubscriptionComparisonBars({ items = [], keepName }) {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  const maxPrice = Math.max(...items.map(i => i.price || 0), 1);

  useEffect(() => {
    // trigger animation after mount
    requestAnimationFrame(() => setAnimate(true));
  }, []);

  return (
    <div className="mt-3 space-y-3">
      {items.map((item) => {
        const isCheapest = item.name === keepName;
        const widthPercent = Math.round((item.price / maxPrice) * 100);

        return (
          <div key={item.name}>
            {/* Label row */}
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-1">
              <span className="flex items-center gap-1">
                {item.name}
                {isCheapest && (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                )}
              </span>
              <span>
                {item.price.toFixed(2)} {item.currency}
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-400 ease-out
                  ${isCheapest ? "bg-green-500" : "bg-orange-400"}`}
                style={{
                  width: animate ? `${widthPercent}%` : "0%",
                }}
              />
            </div>

            {/* Micro label */}
            {isCheapest && (
              <div className="text-[11px] text-green-600 mt-1">
                {t(
                  "overlaps.lowest_cost",
                  "Lowest monthly cost"
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
