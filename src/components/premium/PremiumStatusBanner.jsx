import React from "react";
import { usePremium } from "../../hooks/usePremium";
import { Trans, useTranslation } from "react-i18next";

/**
 * PremiumStatusBanner
 * - Displays current premium subscription status messages
 * - Handles canceled, past-due, and expired states
 * - Renders nothing if status is unknown
 */
export default function PremiumStatusBanner() {
  const {
    isPremium,
    cancelAtPeriodEnd,
    premiumEndsAt,
    status,
  } = usePremium();

  const { t } = useTranslation();

  // No known subscription state → render nothing
  if (!status) return null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : null;

  /* ---------------- Canceled but still active ---------------- */
  if (isPremium && cancelAtPeriodEnd) {
    return (
      <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded mb-3">
        <Trans
          i18nKey="premium.expires_notice"
          values={{ date: formatDate(premiumEndsAt) }}
          components={{ strong: <strong /> }}
        />
      </div>
    );
  }

  /* ---------------- Payment failed ---------------- */
  if (status === "past_due") {
    return (
      <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3">
        {t("payment.failed_notice")}
      </div>
    );
  }

  /* ---------------- Fully expired ---------------- */
  if (!isPremium && status === "canceled") {
    return (
      <div className="bg-gray-100 text-gray-600 text-xs p-2 rounded mb-3">
        {t("premium.expired_notice")}
      </div>
    );
  }

  return null;
}

/* ------------------------------------
   PropTypes
------------------------------------ */

/**
 * This component currently receives no external props.
 * PropTypes are intentionally explicit to prevent misuse.
 */
PremiumStatusBanner.propTypes = {};
