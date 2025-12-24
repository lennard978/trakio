import Card from "../ui/Card";
import SettingButton from "../ui/SettingButton";
import { usePremium } from "../../hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { consumePremiumIntent } from "../../utils/premiumIntent";
import { useEffect, useState } from "react";

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
      {premium.hasActiveTrial && "Trial"}
      {premium.isPremium && "Active"}
      {!premium.hasActiveTrial && !premium.isPremium && "Free"}
    </span>

  ) : null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Subscription</h3>
        {badge}
      </div>

      {loading && (
        <p className="text-sm text-gray-400">Checking subscription status…</p>
      )}

      {!loading && premium.isPremium && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            You have full access to all Premium features.
          </p>

          {cancelAtPeriodEnd ? (
            <p className="text-yellow-600 dark:text-yellow-400">
              Access ends on <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          ) : (
            <p className="text-gray-500">
              Next billing date: <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          )}

          {/* Trust boosters */}
          {nextBillingText && (
            <p className="text-gray-500">{nextBillingText}</p>
          )}
          <p className="text-xs text-gray-400">
            Cancel anytime. Your plan stays active until the end of the billing period.
          </p>

          <SettingButton variant="neutral" onClick={openBillingPortal}>
            Manage subscription
          </SettingButton>
        </div>
      )}

      {!loading && premium.hasActiveTrial && !premium.isPremium && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            You’re currently on a free trial.
          </p>

          {/* Trial end date */}
          {trialEndsAt && (
            <p className="text-gray-500">
              Trial ends on <strong>{formatDate(trialEndsAt)}</strong>
            </p>
          )}

          {/* Days left */}
          <p className="text-xs text-gray-500">
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left
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
            €4/month after trial
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
            Upgrade to Premium
          </SettingButton>

          {/* Cancel trial */}
          <button
            type="button"
            onClick={premium.cancelTrial}
            className="text-xs text-gray-400 hover:text-red-500 underline mt-1 self-start"
          >
            Cancel trial
          </button>
        </div>
      )}


      {!loading && status === "past_due" && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            Your last payment failed.
          </p>
          <p className="text-gray-500">
            Please update your billing details to keep Premium access.
          </p>

          <SettingButton variant="danger" onClick={openBillingPortal}>
            Fix payment
          </SettingButton>
        </div>
      )}
      {!loading && !premium.isPremium && !premium.hasActiveTrial && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            You’re currently on the free plan.
          </p>

          <p className="text-gray-500">
            Start a free 7-day trial to unlock premium features.
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
              Start free trial
            </SettingButton>

          )}

          {/* Secondary upgrade path */}
          <SettingButton
            variant="neutral"
            onClick={() => navigate("/premium")}
          >
            View Premium plans
          </SettingButton>

          <p className="text-xs text-gray-400">
            No payment required · Cancel anytime
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
