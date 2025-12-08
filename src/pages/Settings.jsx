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

    // Trial users do NOT have Stripe customers → block portal
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
    } catch (err) {
      const raw = await res.text();
      console.error("RAW RESPONSE:", raw);
      alert("Server error");
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Unable to open customer portal.");
    }
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

    if (isPremium && !trialEnds) {
      return t("settings_premium_no_trial") || "Premium active (no trial).";
    }

    return t("settings_trial_not_started");
  };

  // --------------------------------------------------
  //  PREMIUM INFORMATION
  // --------------------------------------------------
  const getPremiumInfo = () => {
    const now = new Date();

    // Trial user
    if (isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now <= end) {
        return t("settings_premium_trial_active");
      }
    }

    // Paid subscriber
    if (isPremium && !trialEnds) {
      return t("settings_premium_active");
    }

    // No premium
    if (!isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now > end) {
        return `${t("settings_premium_trial_expired")}: ${end.toLocaleDateString()}`;
      }
    }

    return t("settings_premium_none");
  };

  // --------------------------------------------------
  //  UI RENDER
  // --------------------------------------------------
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

        {/* TRIAL INFO */}
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

          {/* CONDITIONAL BUTTONS */}
          {isPremium && !trialEnds ? (
            // Paid Premium → show portal button
            <button
              onClick={handleManageSubscription}
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition mt-3"
            >
              Manage Subscription
            </button>
          ) : (
            // Trial or non-premium → show upgrade button
            <button
              onClick={() => navigate("/premium")}
              className="w-full bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 transition mt-3"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          {t("settings_logout")}
        </button>

        {/* BACK */}
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
