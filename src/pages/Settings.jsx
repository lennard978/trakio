import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { usePremiumContext } from "../context/PremiumContext";

export default function Settings() {
  const { user, logout } = useAuth();
  const { isPremium, trialEnds } = usePremiumContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremiumContext();


  const handleManageSubscription = async () => {
    // Load user from localStorage
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    const email = user?.email;

    if (!email) {
      alert("Please log in again.");
      return;
    }

    try {
      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // ✅ email is defined here
      });

      // If server returned error (like 500), log raw text once
      if (!res.ok) {
        const raw = await res.text();
        console.error("Portal HTTP error:", res.status, raw);
        alert("Server error while opening customer portal.");
        return;
      }

      // OK → parse JSON once
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal response missing url:", data);
        alert("Could not open customer portal.");
      }
    } catch (err) {
      console.error("Portal fetch error:", err);
      alert("Network error while opening customer portal.");
    }
  };




  const handleLogout = () => {
    logout();
    showToast(t("toast_logout_success"), "success");
    navigate("/");
  };

  // ✅ Trial status derived from PremiumContext
  const getTrialInfo = () => {
    const now = new Date();

    if (!trialEnds && !isPremium) {
      // Never started
      return t("settings_trial_not_started");
    }

    if (trialEnds) {
      const end = new Date(trialEnds);

      if (now > end && !isPremium) {
        // Trial ended and user is no longer premium
        return `${t("settings_trial_expired")}: ${end.toLocaleDateString()}`;
      }

      if (now <= end && isPremium) {
        // Currently on free trial
        return `${t("settings_trial_ends")}: ${end.toLocaleDateString()}`;
      }
    }

    // Premium without trial (e.g. manual upgrade / Stripe in future)
    if (isPremium && !trialEnds) {
      return t("settings_trial_premium_no_trial") || "Premium active (no trial)";
    }

    return t("settings_trial_not_started");
  };

  // ✅ Premium subscription text
  const getPremiumInfo = () => {
    const now = new Date();

    if (isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now <= end) {
        return t("settings_premium_trial_active") ||
          `On free trial until ${end.toLocaleDateString()}`;
      }
    }

    if (isPremium && !trialEnds) {
      return t("settings_premium_active") || "Premium subscription is active.";
    }

    if (!isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now > end) {
        return t("settings_premium_trial_expired") ||
          `Trial expired on ${end.toLocaleDateString()}.`;
      }
    }

    return t("settings_premium_none");
  };

  return (
    <div className="max-w-lg mx-auto mt-2 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t("settings_title")}
      </h1>

      <div className="space-y-4">
        {/* ACCOUNT INFO */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t("settings_account")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_email")}:{" "}
            <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        {/* TRIAL INFO (from PremiumContext) */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t("settings_trial")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {getTrialInfo()}
          </p>
        </div>

        {/* PREMIUM SECTION */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t("settings_premium_title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {getPremiumInfo()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t("settings_premium_info")}
          </p>
          {premium.isPremium && (
            <button
              onClick={handleManageSubscription}
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Manage Subscription
            </button>
          )}

        </div>

        {/* NOTIFICATIONS */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("settings_notifications")}
          </h2>

          <button
            onClick={async () => {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                showToast(t("settings_notifications_enabled"), "success");
              } else {
                showToast(t("settings_notifications_blocked"), "error");
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {t("settings_notifications_enable")}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t("settings_notifications_info")}
          </p>
        </div>

        {/* ACTIONS */}
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          {t("settings_logout")}
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {t("settings_back_to_dashboard")}
        </button>
      </div>
    </div>
  );
}
