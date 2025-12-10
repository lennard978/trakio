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
    status,
    trialEndDate,
    hasActiveTrial,
    trialExpired,
    noTrial,
  } = usePremium();

  /** ------------------------------------------------------------------
   *  Stripe Customer Portal
   * ------------------------------------------------------------------ */
  const handleManageSubscription = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
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
   *  TRIAL TEXT LOGIC
   * ------------------------------------------------------------------ */
  const renderTrialContent = () => {
    // Paid premium and no trial info
    if (isPremium && !trialEndDate) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_premium_no_trial")}
        </p>
      );
    }

    // Active trial, not premium
    if (hasActiveTrial && trialEndDate) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_trial_ends")}:{" "}
          {trialEndDate.toLocaleDateString()}
        </p>
      );
    }

    // Trial expired, not premium
    if (trialExpired && trialEndDate) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_premium_trial_expired")}:{" "}
          {trialEndDate.toLocaleDateString()}
        </p>
      );
    }

    // No trial, not premium
    if (noTrial && !isPremium) {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t("settings_trial_not_started")}
        </p>
      );
    }

    // Fallback
    return (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {t("settings_trial_not_started")}
      </p>
    );
  };

  /** ------------------------------------------------------------------
   *  PREMIUM SECTION CONTENT
   * ------------------------------------------------------------------ */
  const renderPremiumSection = () => {
    // Paid premium user
    if (isPremium) {
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
            {t("settings_manage_subscription")}
          </SettingButton>
        </>
      );
    }

    // Not premium
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

      {/* TRIAL INFO */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_trial")}
        </h2>
        {renderTrialContent()}
      </Card>

      {/* PREMIUM SECTION */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_premium_title")}
        </h2>

        if (isPremium && status !== "trial") {
          renderPremiumSection()
        }
      </Card>

      {/* LOGOUT + BACK */}
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
