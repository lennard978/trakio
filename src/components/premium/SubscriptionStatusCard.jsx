import Card from "../ui/Card";
import SettingButton from "../ui/SettingButton";
import { usePremium } from "../../hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { consumePremiumIntent } from "../../utils/premiumIntent";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    // fallback
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function trialProgressPercent(daysLeft, totalDays = 7) {
  if (typeof daysLeft !== "number") return 0;
  return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
}

function trialProgressColor(daysLeft) {
  if (daysLeft <= 1) return "bg-red-500";
  if (daysLeft <= 2) return "bg-orange-500";
  return "bg-blue-500";
}

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}


export default function SubscriptionStatusCard() {
  const premium = usePremium();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅ Fix: bring t into this scope

  const {
    loading,
    status,
    premiumEndsAt,
    trialEndsAt,
    cancelAtPeriodEnd,
  } = premium;

  // Trial calculations
  const trialTotalDays = 7;
  const daysLeft = premium.trialDaysLeft;

  const [highlightTrial, setHighlightTrial] = useState(false);

  useEffect(() => {
    const intent = consumePremiumIntent();
    if (intent && premium.noTrial) {
      setHighlightTrial(true);
    }
  }, [premium.noTrial]);


  // UX-safe progress (never 0 unless expired)
  const progressPercent =
    typeof daysLeft === "number"
      ? clamp(
        100 - (daysLeft / trialTotalDays) * 100,
        8,   // 👈 minimum visible fill
        100
      )
      : 0;


  const urgentTrial = daysLeft !== null && daysLeft <= 2;


  // Optional fields (only shown if your PremiumContext already provides them)
  const nextBillingAmount = premium?.nextBillingAmount; // number (e.g., 4 or 40)
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

  const badge = !loading && status ? (
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
      {!premium.hasActiveTrial && !premium.isPremium && t("subscription_badge_free")}
    </span>

  ) : null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("subscription")}</h3>
        {badge}
      </div>

      {loading && (
        <p className="text-sm text-gray-400">{t("subscription_checking")}</p>
      )}

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
              {t("subscription_next_billing", { date: formatDate(premiumEndsAt) || "N/A" })}
            </p>
          )}

          {/* Trust boosters */}
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

      {!loading && premium.hasActiveTrial && !premium.isPremium && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_trial")}
          </p>

          {/* Trial end date */}
          {trialEndsAt && (
            <p className="text-gray-500">
              {t("subscription_trial_ends", { date: formatDate(trialEndsAt) || "N/A" })}
            </p>
          )}

          {/* Days left */}
          <p className="text-xs text-gray-500">
            {t(daysLeft === 1 ? "subscription_trial_days_left" : "subscription_trial_days_left_plural", {
              days: daysLeft,
            })}
          </p>


          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className={`
      h-full transition-all duration-700
      ${urgentTrial ? "bg-orange-500 animate-pulse-soft" : "bg-blue-500"}
    `}
              style={{
                width: `${progressPercent}%`,
                boxShadow: urgentTrial
                  ? "0 0 12px rgba(249,115,22,0.8)"
                  : "0 0 8px rgba(59,130,246,0.6)",
              }}
            />
          </div>



          {/* Price hint */}
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className="text-green-400">💸</span>
            {t("subscription_price_hint")}
          </p>


          {/* CTA */}
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

          {/* Cancel trial */}
          <button
            type="button"
            onClick={premium.cancelTrial}
            className="text-xs text-gray-400 hover:text-red-500 underline mt-1 self-start"
          >
            {t("subscription_cancel_trial")}
          </button>
        </div>
      )}


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
      {!loading && !premium.isPremium && !premium.hasActiveTrial && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            {t("subscription_free_plan")}
          </p>

          <p className="text-gray-500">
            {t("subscription_start_trial_info")}
          </p>

          {/* Start trial (primary CTA) */}
          {premium.noTrial && (
            <SettingButton
              onClick={premium.startTrial}
              className={
                highlightTrial
                  ? "ring-2 ring-orange-400 shadow-orange-500/40 shadow-lg animate-pulse-soft"
                  : ""
              }
            >
              {t("subscription_start_trial")}
            </SettingButton>

          )}

          {/* Secondary upgrade path */}
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

if (typeof document !== "undefined") {
  const styleId = "trial-progress-animations";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes pulseSoft {
        0% {
          opacity: 1;
          transform: scaleX(1);
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 1;
          transform: scaleX(1);
        }
      }

      .animate-pulse-soft {
        animation: pulseSoft 1.4s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}
