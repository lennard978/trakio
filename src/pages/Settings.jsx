// src/pages/Settings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { usePremiumContext } from "../context/PremiumContext";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Settings() {
  const { user, logout } = useAuth();
  const premium = usePremiumContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { isPremium, trialEnds } = premium;

  /** ------------------------------------------------------------------
   *  Redirect user to Stripe Customer Portal
   * ------------------------------------------------------------------ */
  const handleManageSubscription = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    if (!email) {
      alert("Please log in again.");
      return;
    }

    const res = await fetch("/api/stripe/customer-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      alert("Server error");
      return;
    }

    if (data?.url) window.location.href = data.url;
    else alert("Unable to open customer portal.");
  };

  /** ------------------------------------------------------------------
   *  Derived state values
   * ------------------------------------------------------------------ */

  const now = new Date();
  const trialEndDate = trialEnds ? new Date(trialEnds) : null;

  const hasActiveTrial =
    trialEndDate && now <= trialEndDate && !isPremium;

  const trialExpired =
    trialEndDate && now > trialEndDate && !isPremium;

  const noTrial =
    !trialEndDate && !isPremium;

  /** ------------------------------------------------------------------
   *  Render functions for Premium Box
   * ------------------------------------------------------------------ */

  const renderPremiumSection = () => {
    // 1) Premium user (paid, not trial)
    if (isPremium && !trialEndDate) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_premium_active")}
          </p>

          <SettingButton
            variant="primary"
            className="mt-4"
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </SettingButton>
        </>
      );
    }

    // 2) Active trial, not premium
    if (hasActiveTrial) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_trial_ends")}: {trialEndDate.toLocaleDateString()}
          </p>

          <SettingButton
            variant="success"
            className="mt-4"
            onClick={() => navigate("/premium")}
          >
            Upgrade to Premium
          </SettingButton>
        </>
      );
    }

    // 3) Trial expired & not premium
    if (trialExpired) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_premium_trial_expired")}:{" "}
            {trialEndDate.toLocaleDateString()}
          </p>

          <SettingButton
            variant="success"
            className="mt-4"
            onClick={() => navigate("/premium")}
          >
            Upgrade to Premium
          </SettingButton>
        </>
      );
    }

    // 4) No trial + not premium
    if (noTrial) {
      return (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_premium_none")}
          </p>

          <SettingButton
            variant="success"
            className="mt-4"
            onClick={() => navigate("/premium")}
          >
            Upgrade to Premium
          </SettingButton>
        </>
      );
    }

    return null;
  };

  /** ------------------------------------------------------------------ */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-6 pb-20">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white px-2">
        {t("settings_title")}
      </h1>

      {/* ACCOUNT INFO */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_account")}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_email")}:{" "}
          <span className="font-semibold">{user?.email}</span>
        </p>
      </Card>

      {/* TRIAL INFORMATION */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_trial")}
        </h2>

        {/* Trial text logic */}
        {isPremium && !trialEndDate && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_premium_no_trial")}
          </p>
        )}

        {hasActiveTrial && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_trial_ends")}:{" "}
            {trialEndDate.toLocaleDateString()}
          </p>
        )}

        {trialExpired && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_premium_trial_expired")}:{" "}
            {trialEndDate.toLocaleDateString()}
          </p>
        )}

        {noTrial && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_trial_not_started")}
          </p>
        )}
      </Card>

      {/* PREMIUM SECTION */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_premium_title")}
        </h2>

        {renderPremiumSection()}
      </Card>

      {/* LOGOUT + NAVIGATION */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton
            variant="danger"
            onClick={logout}
          >
            {t("settings_logout")}
          </SettingButton>

          <SettingButton
            variant="neutral"
            onClick={() => navigate("/dashboard")}
          >
            {t("settings_back_to_dashboard")}
          </SettingButton>
        </div>
      </Card>
    </div>
  );
}
