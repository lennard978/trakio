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
  const email = user?.email;
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
    cancelTrial,
  } = usePremium();

  /** ------------------------------------------------------------------
   *  Stripe Customer Portal
   * ------------------------------------------------------------------ */
  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "portal",
          email,
        }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.error || "Unable to open customer portal.");
      }
    } catch (err) {
      console.error("Customer portal error:", err);
      alert("Unable to open customer portal.");
    }
  };


  /** ------------------------------------------------------------------
   *  Trial logic and UI
   * ------------------------------------------------------------------ */
  const handleStartTrial = async () => {
    const success = await startTrial();
    if (success) {
      alert("Trial started successfully.");
    }
  };

  const handleCancelTrial = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel your trial?");
    if (!confirmed) return;

    const success = await cancelTrial();
    if (success) {
      alert("Trial cancelled.");
    }
  };

  const renderTrialContent = () => {
    if (hasActiveTrial && trialEndDate) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("trial_end")} <strong>{trialEndDate.toLocaleDateString()}</strong>
            {trialDaysLeft !== null && (
              <span> ({trialDaysLeft} {t("day")}{trialDaysLeft === 1 ? "" : "s"} {t("left")})</span>
            )}
          </p>
          <SettingButton variant="danger" onClick={handleCancelTrial}>
            {t("cancel_trial")}
          </SettingButton>
        </div>
      );
    }

    if (trialExpired && trialEndDate) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("trial_expired")} <strong>{trialEndDate.toLocaleDateString()}</strong>
        </p>
      );
    }

    if (noTrial) {
      return (
        <SettingButton variant="success" onClick={handleStartTrial}>
          {t("start_seven_days")}
        </SettingButton>
      );
    }

    if (isPremium) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("no_info")}
        </p>
      );
    }

    return null;
  };

  const renderPremiumContent = () => {
    if (isPremium) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("active_sub")}
          </p>
          {/* Only show manage button if not on trial */}
          {!hasActiveTrial && (
            <SettingButton variant="primary" className="mt-3" onClick={handleManageSubscription}>
              {t("manage_sub")}
            </SettingButton>
          )}
        </>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("free_plan")}
        </p>

        {!hasActiveTrial && (
          <SettingButton variant="success" onClick={() => navigate("/premium")}>
            {t("upgrade_premium")}
          </SettingButton>
        )}
      </div>
    );
  };

  /** ------------------------------------------------------------------ */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-4 pb-2">
      <h1 className="text-2xl text-center font-bold mb-2 text-gray-900 dark:text-white px-2">
        {t("settings_title") || "Settings"}
      </h1>

      {/* ACCOUNT INFO */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_account") || "Account"}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_email") || "Email"}:{" "}
          <span className="font-semibold">{user?.email}</span>
        </p>
      </Card>

      <button
        onClick={() => navigate("/premium")}
        className="text-blue-500 underline"
      >
        Upgrade to Premium
      </button>


      {/* TRIAL INFO */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("trial_status")}
        </h2>
        {renderTrialContent()}
      </Card>

      {/* PREMIUM STATUS */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("premium_subscription")}
        </h2>
        {renderPremiumContent()}
      </Card>

      {/* LOGOUT + BACK */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton variant="danger" onClick={logout}>
            {t("settings_logout") || "Log Out"}
          </SettingButton>

          <SettingButton variant="neutral" onClick={() => navigate("/dashboard")}>
            {t("settings_back_to_dashboard") || "Back to Dashboard"}
          </SettingButton>
        </div>
      </Card>
    </div>
  );
}
