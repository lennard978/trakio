import Card from "../ui/Card";
import SettingButton from "../ui/SettingButton";
import { usePremium } from "../../hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

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
        ${status === "active"
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          : status === "trialing"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : status === "past_due"
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        }
      `}
    >
      {status === "active" && "Active"}
      {status === "trialing" && "Trial"}
      {status === "past_due" && "Payment issue"}
      {status === "canceled" && "Free plan"}
      {!["active", "trialing", "past_due", "canceled"].includes(status) && status}
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

      {!loading && status === "active" && (
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

      {!loading && status === "trialing" && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            You’re currently on a free trial.
          </p>

          {trialEndsAt && (
            <p className="text-gray-500">
              Trial ends on <strong>{formatDate(trialEndsAt)}</strong>
            </p>
          )}

          <p className="text-xs text-gray-400">
            Cancel anytime during the trial.
          </p>

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
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

      {!loading && (status === "canceled" || !status) && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            You’re currently on the free plan.
          </p>
          <p className="text-gray-500">
            Upgrade to unlock advanced insights, alerts, and exports.
          </p>

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
        </div>
      )}
    </Card>
  );
}
