import React from "react";
import SubscriptionItem from "./SubscriptionItem";
import { useTranslation } from "react-i18next";

export default function SubscriptionList({
  items,
  onDelete,
  currency,
  rates,
  convert,
}) {
  const { t } = useTranslation();

  if (!items.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
        {t("dashboard_empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((sub) => (
        <SubscriptionItem
          key={sub.id}
          item={sub}
          onDelete={onDelete}
          currency={currency}
          rates={rates}
          convert={convert}
        />
      ))}
    </div>
  );
}
