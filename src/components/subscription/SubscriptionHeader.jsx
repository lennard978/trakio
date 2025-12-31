// SubscriptionHeader.jsx

import React from "react";
import HealthBadge from "../HealthBadge";
import CategoryChip from "../CategoryChip";
import PriceAlertBadge from "../PriceAlertBadge";
import { useTranslation } from "react-i18next";
import { CATEGORY_COLORS } from "../CategoryChip";
import { getCategoryStyles } from "../../utils/CategoryStyles";
import { subscriptionHealth } from "../../utils/subscriptionHealth";

/**
 * Header section of the Subscription card.
 * Displays the health badge, icon, title, price, renewal info, and category badges.
 */
export default function SubscriptionHeader({ item, currency, displayPrice, nextPaymentText, premium }) {
  const { t } = useTranslation();
  const categoryStyle = getCategoryStyles(item.category);

  return (
    <div className="flex justify-between items-start mb-1">
      <div className="flex flex-row">
        <div className="flex flex-col justify-center items-center">
          <HealthBadge {...subscriptionHealth(item)} />
          <div className="p-2">
            {item.icon ? (
              <img
                src={`/icons/${item.icon}.svg`}
                alt={item.name}
                className="w-8 h-8"
              />
            ) : (
              <span className="text-xl" title={item.category}>
                {categoryStyle.icon}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col ml-2">
            <div className="text-lg text-black dark:text-gray-300 font-tight tracking-tight drop-shadow-sm font-semibold">
              {item.name}
            </div>

            <div className="text-xs text-black dark:text-gray-300 font-medium tabular-nums">
              {currency} {displayPrice?.toFixed(2)} /{" "}
              {t(`frequency_${item.frequency}`)}
            </div>

            <div className="text-xs text-black dark:text-gray-300 tabular-nums">
              {nextPaymentText}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <CategoryChip category={item.category} />
        {premium?.isPremium && item.priceAlert && (
          <PriceAlertBadge alert={item.priceAlert} />
        )}
      </div>
    </div>
  );
}
