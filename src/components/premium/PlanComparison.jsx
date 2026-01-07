import React from "react";
import PropTypes from "prop-types";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import Card from "./ui/Card";

/* ---------------- Feature Row ---------------- */

function FeatureRow({ label, free, premium }) {
  return (
    <div
      className="grid grid-cols-3 items-center py-2 text-sm"
      role="row"
    >
      <div
        role="rowheader"
        className="text-gray-700 dark:text-gray-300"
      >
        {label}
      </div>

      <div className="flex justify-center" role="cell">
        {free ? (
          <CheckIcon
            className="w-5 h-5 text-green-600"
            aria-label="Available in free plan"
          />
        ) : (
          <XMarkIcon
            className="w-5 h-5 text-gray-400"
            aria-label="Not available in free plan"
          />
        )}
      </div>

      <div className="flex justify-center" role="cell">
        {premium ? (
          <CheckIcon
            className="w-5 h-5 text-green-600"
            aria-label="Available in premium plan"
          />
        ) : (
          <XMarkIcon
            className="w-5 h-5 text-gray-400"
            aria-label="Not available in premium plan"
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- PropTypes: FeatureRow ---------------- */

FeatureRow.propTypes = {
  label: PropTypes.string.isRequired,
  free: PropTypes.bool.isRequired,
  premium: PropTypes.bool.isRequired,
};

/* ---------------- Main Component ---------------- */

export default function PlanComparison() {
  const { t } = useTranslation();

  const features = [
    { key: "track", free: true, premium: true },
    { key: "upcoming", free: true, premium: true },
    { key: "budget", free: false, premium: true },
    { key: "forgotten", free: false, premium: true },
    { key: "price_alerts", free: false, premium: true },
    { key: "analytics", free: false, premium: true },
    { key: "export", free: false, premium: true },
  ];

  return (
    <Card
      aria-labelledby="plan-comparison-title"
      className="space-y-4"
    >
      <h2
        id="plan-comparison-title"
        className="text-lg font-semibold"
      >
        {t("plan_comparison.title")}
      </h2>

      {/* Header */}
      <div
        className="grid grid-cols-3 text-xs font-medium text-gray-500"
        role="row"
      >
        <div role="columnheader" />
        <div role="columnheader" className="text-center">
          {t("plan_comparison.free")}
        </div>
        <div role="columnheader" className="text-center">
          {t("plan_comparison.premium")}
        </div>
      </div>

      {/* Rows */}
      <div
        role="table"
        aria-label={t("plan_comparison.aria_label")}
        className="divide-y dark:divide-gray-800"
      >
        {features.map((f) => (
          <FeatureRow
            key={f.key}
            label={t(`plan_comparison.features.${f.key}`)}
            free={f.free}
            premium={f.premium}
          />
        ))}
      </div>
    </Card>
  );
}

/* ---------------- PropTypes: PlanComparison ---------------- */
/* (no external props yet – intentionally explicit) */

PlanComparison.propTypes = {};
