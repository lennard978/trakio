// src/pages/Settings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { usePremiumContext } from "../context/PremiumContext";

// Reusable UI components
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Settings() {
  const { user, logout } = useAuth();
  const { isPremium, trialEnds } = usePremiumContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremiumContext();

  // --------------------------------------------------
  //  HANDLE CUSTOMER PORTAL
  // --------------------------------------------------
  const handleManageSubscription = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    if (!email) {
      alert("Please log in again.");
      return;
    }

    if (trialEnds) {
      alert("Trial users cannot manage subscription yet. Please upgrade first.");
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

  // --------------------------------------------------
  //  TRIAL INFORMATION DISPLAY
  // --------------------------------------------------
  const getTrialInfo = () => {
    const now = new Date();

    if (!trialEnds && !isPremium) return t("settings_trial_not_started");

    if (trialEnds) {
      const end = new Date(trialEnds);
      if (now > end && !isPremium) {
        return `${t("settings_trial_expired")}: ${end.toLocaleDateString()}`;
      }
      if (now <= end && isPremium) {
        return `${t("settings_trial_ends")}: ${end.toLocaleDateString()}`;
      }
    }

    if (isPremium && !trialEnds) return t("settings_premium_no_trial");

    return t("settings_trial_not_started");
  };

  // --------------------------------------------------
  //  PREMIUM INFORMATION
  // --------------------------------------------------
  const getPremiumInfo = () => {
    const now = new Date();

    if (isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now <= end) return t("settings_premium_trial_active");
    }

    if (isPremium && !trialEnds) return t("settings_premium_active");

    if (!isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now > end)
        return `${t("settings_premium_trial_expired")}: ${end.toLocaleDateString()}`;
    }

    return t("settings_premium_none");
  };

  // --------------------------------------------------
  //  UI RENDER
  // --------------------------------------------------
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
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {getTrialInfo()}
        </p>
      </Card>

      {/* PREMIUM SECTION */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("settings_premium_title")}
        </h2>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          {getPremiumInfo()}
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("settings_premium_active")}
        </p>

        {isPremium && !trialEnds ? (
          <SettingButton variant="primary" onClick={handleManageSubscription} className="mt-4">
            Manage Subscription
          </SettingButton>
        ) : (
          <SettingButton variant="success" onClick={() => navigate("/premium")} className="mt-4">
            Upgrade to Premium
          </SettingButton>
        )}
      </Card>

      <SettingButton variant="danger" onClick={logout}>
        {t("settings_logout")}
      </SettingButton>

      <SettingButton variant="neutral" onClick={() => navigate("/dashboard")}>
        {t("settings_back_to_dashboard")}
      </SettingButton>
    </div>
  );
}
