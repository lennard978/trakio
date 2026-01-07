import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Card from "../ui/Card";
import SettingButton from "../ui/SettingButton";
import { usePremium } from "../../hooks/usePremium";
import { consumePremiumIntent } from "../../utils/premiumIntent";

/* -------------------- Helpers -------------------- */

function formatDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return null;
  }
}

function formatMoney(amount, currency = "EUR") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

/* -------------------- Component -------------------- */

export default function SubscriptionStatusCard() {
  const premium = usePremium();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    loading,
    status,
    premiumEndsAt,
    trialEndsAt,
    cancelAtPeriodEnd,
  } = premium;

  const trialTotalDays = 7;
  const daysLeft = premium.trialDaysLeft;

  const trialDaysKey =
    daysLeft === 1
      ? "subscription_trial_days_left_one"
      : "subscription_trial_days_left_other";

  const [highlightTrial, setHighlightTrial] = useState(false);

  useEffect(() => {
    const intent = consumePremiumIntent();
    if (intent && premium.noTrial) {
      setHighlightTrial(true);
    }
  }, [premium.noTrial]);

  const progressPercent =
    typeof daysLeft === "number"
      ? clamp(100 - (daysLeft / trialTotalDays) * 100, 8, 100)
      : 0;

  const urgentTrial = daysLeft !== null && daysLeft <= 2;

  const nextBillingAmount = premium?.nextBillingAmount;
  const nextBillingCurrency = premium?.nextBillingCurrency || "EUR";

  const nextBillingText = useMemo(() => {
    const formatted = formatMoney(nextBillingAmount, nextBillingCurrency);
    return formatted ? `Next billing amount: ${formatted}` : null;
  }, [nextBillingAmount, nextBillingCurrency]);

  const openBillingPortal = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "portal" }),
      });

      if (!res.ok) throw new Error("Portal error");

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Billing portal error:", err);
      alert("Unable to open billing settings. Please try again.");
    }
  };

  const badge =
    !loading && status ? (
      <span
        className={`
          text-xs px-2 py-0.5 rounded-full font-medium
          ${premium.hasActiveTrial
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : premium.isPremium
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }
        `}
      >
        {premium.hasActiveTrial && t("subscription_badge_trial")}
        {premium.isPremium && t("subscription_badge_active")}
        {!premium.hasActiveTrial &&
          !premium.isPremium &&
          t("subscription_badge_free")}
      </span>
    ) : null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("subscription")}</h3>
        {badge}
      </div>

      {loading && (
        <p className="text-sm text-gray-400">
          {t("subscription_checking")}
        </p>
      )}

      {/* PREMIUM ACTIVE */}
      {!loading && premium.isPremium && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_active_access")}
          </p>

          {cancelAtPeriodEnd ? (
            <p className="text-yellow-600 dark:text-yellow-400">
              {t("subscription_access_ends")}
            </p>
          ) : (
            <p className="text-gray-500">
              {t("subscription_next_billing", {
                date: premiumEndsAt ? formatDate(premiumEndsAt) : "N/A",
              })}
            </p>
          )}

          {nextBillingText && (
            <p className="text-gray-500">{nextBillingText}</p>
          )}

          <p className="text-xs text-gray-400">
            {t("subscription_cancel_note")}
          </p>

          <SettingButton variant="neutral" onClick={openBillingPortal}>
            {t("subscription_manage")}
          </SettingButton>
        </div>
      )}

      {/* ACTIVE TRIAL */}
      {!loading && premium.hasActiveTrial && !premium.isPremium && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_trial")}
          </p>

          {trialEndsAt && (
            <p className="text-gray-500">
              {t("subscription_trial_ends", {
                date: formatDate(trialEndsAt) || "N/A",
              })}
            </p>
          )}

          {daysLeft !== null && (
            <p className="text-xs text-gray-500">
              {t(trialDaysKey, { days: daysLeft })}
            </p>
          )}

          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className={`
                h-full transition-all duration-700
                ${urgentTrial ? "bg-orange-500 animate-pulse-soft" : "bg-blue-500"}
              `}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className="text-green-400">💸</span>
            {t("subscription_price_hint")}
          </p>

          <SettingButton
            onClick={() => navigate("/premium")}
            className={
              urgentTrial
                ? "ring-2 ring-orange-400 shadow-orange-500/30 shadow-lg"
                : ""
            }
          >
            {t("subscription_upgrade_cta")}
          </SettingButton>

          <button
            type="button"
            onClick={premium.cancelTrial}
            className="text-xs text-gray-400 hover:text-red-500 underline"
          >
            {t("subscription_cancel_trial")}
          </button>
        </div>
      )}

      {/* PAYMENT FAILED */}
      {!loading && status === "past_due" && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_failed")}
          </p>
          <p className="text-gray-500">
            {t("subscription_failed_details")}
          </p>

          <SettingButton variant="danger" onClick={openBillingPortal}>
            {t("subscription_fix_payment")}
          </SettingButton>
        </div>
      )}

      {/* FREE */}
      {!loading && !premium.isPremium && !premium.hasActiveTrial && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_free_plan")}
          </p>

          <p className="text-gray-500">
            {t("subscription_start_trial_info")}
          </p>

          {premium.noTrial && (
            <SettingButton
              onClick={() => navigate("/premium")}
              className={
                highlightTrial
                  ? "ring-2 ring-orange-400 shadow-orange-500/40 shadow-lg animate-pulse-soft"
                  : ""
              }
            >
              {t("subscription_start_trial")}
            </SettingButton>
          )}

          <SettingButton
            variant="neutral"
            onClick={() => navigate("/premium")}
          >
            {t("subscription_view_plans")}
          </SettingButton>

          <p className="text-xs text-gray-400">
            {t("subscription_no_payment_note")}
          </p>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------
   PropTypes
------------------------------------ */

/**
 * This component receives no external props.
 * PropTypes are explicitly defined to prevent misuse.
 */
SubscriptionStatusCard.propTypes = {};
