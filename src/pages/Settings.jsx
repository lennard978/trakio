// src/pages/Settings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    isPremium,
    trialEndDate,
    hasActiveTrial,
    trialExpired,
    noTrial,
    trialDaysLeft,
    startTrial,
  } = usePremium();

  /** ------------------------------------------------------------------
   *  Stripe Customer Portal
   * ------------------------------------------------------------------ */
  const handleManageSubscription = async () => {
    try {
      const email = user?.email;
      if (!email) {
        alert("Please log in again.");
        return;
      }

      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to open customer portal.");
      }
    } catch (err) {
      console.error("Customer portal error:", err);
      alert("Unable to open customer portal.");
    }
  };

  /** ------------------------------------------------------------------
   * Cancel Trial
   * ------------------------------------------------------------------ */
  const handleCancelTrial = async () => {
    try {
      const res = await fetch("/api/user/cancel-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Could not cancel trial.");
        return;
      }

      alert("Trial cancelled.");
      window.location.reload(); // force update
    } catch (err) {
      console.error("Cancel trial error:", err);
      alert("Could not cancel trial.");
    }
  };

  /** ------------------------------------------------------------------
   * Trial section UI
   * ------------------------------------------------------------------ */
  const renderTrialContent = () => {
    if (hasActiveTrial && trialEndDate) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            Trial ends in <strong>{trialDaysLeft} days</strong> (
            {trialEndDate.toLocaleDateString()})
          </p>
          <SettingButton
            variant="danger"
            onClick={handleCancelTrial}
          >
            Cancel Trial
          </SettingButton>
        </>
      );
    }

    if (trialExpired && trialEndDate) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Trial expired on {trialEndDate.toLocaleDateString()}
        </p>
      );
    }

    if (noTrial) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You haven’t started your free trial yet.
          </p>
          <SettingButton
            variant="success"
            className="mt-2"
            onClick={async () => {
              const ok = await startTrial();
              if (ok) {
                alert("Trial started");
                window.location.reload();
              }
            }}
          >
            Start Free Trial
          </SettingButton>
        </>
      );
    }

    return null;
  };

  /** ------------------------------------------------------------------
   * Premium section UI
   * ------------------------------------------------------------------ */
  const renderPremiumSection = () => {
    if (isPremium) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Premium subscription active.
          </p>
          <SettingButton
            variant="primary"
            className="mt-2"
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </SettingButton>
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          You are not subscribed.
        </p>
        <SettingButton
          variant="success"
          className="mt-2"
          onClick={() => navigate("/premium")}
        >
          Upgrade to Premium
        </SettingButton>
      </>
    );
  };

  /** ------------------------------------------------------------------ */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-6 pb-20">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white px-2">
        {t("settings_title") || "Settings"}
      </h1>

      {/* ACCOUNT INFO */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">
          {t("settings_account") || "Account Info"}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_email") || "Email"}:{" "}
          <span className="font-semibold">{user?.email}</span>
        </p>
      </Card>

      {/* TRIAL SECTION */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">
          Trial
        </h2>
        {renderTrialContent()}
      </Card>

      {/* PREMIUM SECTION */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">
          Subscription
        </h2>
        {/* Only show manage subscription if not on trial */}
        {!hasActiveTrial && renderPremiumSection()}
      </Card>

      {/* LOGOUT / BACK */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton
            variant="danger"
            onClick={logout}
          >
            {t("settings_logout") || "Log Out"}
          </SettingButton>

          <SettingButton
            variant="neutral"
            onClick={() => navigate("/dashboard")}
          >
            {t("settings_back_to_dashboard") || "Back to Dashboard"}
          </SettingButton>
        </div>
      </Card>
    </div>
  );
}
