// src/components/ui/PremiumFeatureRow.jsx
import React from "react";
import PropTypes from "prop-types";
import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * PremiumFeatureRow
 * Displays feature availability for Free vs Premium plans.
 */
export default function PremiumFeatureRow({
  title,
  free = false,
  premium = false,
}) {
  if (!title) return null;

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-700 dark:text-gray-300">
        {title}
      </span>

      <div className="flex gap-6">
        <span
          className="w-6 flex justify-center"
          aria-label={free ? "Available in free plan" : "Not available in free plan"}
        >
          {free && (
            <CheckIcon
              className="w-5 h-5 text-orange-600"
              aria-hidden
            />
          )}
        </span>

        <span
          className="w-6 flex justify-center"
          aria-label={
            premium
              ? "Available in premium plan"
              : "Not available in premium plan"
          }
        >
          {premium && (
            <CheckIcon
              className="w-5 h-5 text-orange-400"
              aria-hidden
            />
          )}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

PremiumFeatureRow.propTypes = {
  title: PropTypes.string.isRequired,
  free: PropTypes.bool,
  premium: PropTypes.bool,
};
