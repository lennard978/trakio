import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";
import SubscriptionStatusCard from "../components/premium/SubscriptionStatusCard";
// import PremiumStatusBanner from "../components/premium/PremiumStatusBanner"
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../hooks/useTheme";
import { MoonIcon, LanguageIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import ThemeSwitch from "../components/ui/ThemeSwitch";
import LanguageSwitch from "../components/ui/LanguageSwitch";
// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import SettingsRow from "../components/ui/SettingsRow";
import languages from "../utils/languages";

import {
  GlobeAltIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { CURRENCY_LABELS } from "../utils/currencyLabels";
import {
  exportSubscriptionsCSV,
  exportAnnualSummaryCSV,
  exportFullJSON,
} from "../utils/exportData";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";

export default function Settings({ setActiveSheet }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { i18n } = useTranslation();
  const currentLang = languages.find(l => l.code === i18n.language);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "get", email: user.email }),
      });

      const data = await res.json();
      setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
    })();
  }, [user?.email]);


  const toggleLanguage = () => {
    const next = currentLang === "en" ? "de" : "en";
    i18n.changeLanguage(next);
  };


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

  /* ------------------------------------------------------------------
   * Budget state (FIXED)
   * ------------------------------------------------------------------ */
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem("monthly_budget");
    return saved ? Number(saved) : null;
  });

  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(() => {
    return localStorage.getItem("budget_alerts_enabled") === "1";
  });

  // Persist budget settings
  useEffect(() => {
    if (monthlyBudget == null) {
      localStorage.removeItem("monthly_budget");
    } else {
      localStorage.setItem("monthly_budget", String(monthlyBudget));
    }

    localStorage.setItem(
      "budget_alerts_enabled",
      budgetAlertsEnabled ? "1" : "0"
    );
  }, [monthlyBudget, budgetAlertsEnabled]);

  /* ------------------------------------------------------------------
   * Stripe Customer Portal
   * ------------------------------------------------------------------ */
  const handleManageSubscription = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "portal" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to open customer portal");
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Customer portal error:", err);
      alert("Unable to open customer portal.");
    }
  };

  /* ------------------------------------------------------------------
   * Trial logic
   * ------------------------------------------------------------------ */
  const handleStartTrial = async () => {
    const success = await startTrial();
    if (success) alert("Trial started successfully.");
  };

  const handleCancelTrial = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your trial?"
    );
    if (!confirmed) return;

    const success = await cancelTrial();
    if (success) alert("Trial cancelled.");
  };

  const renderTrialContent = () => {
    if (hasActiveTrial && trialEndDate) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("trial_end")}{" "}
            <strong>{trialEndDate.toLocaleDateString()}</strong>
            {trialDaysLeft !== null && (
              <span>
                {" "}
                ({trialDaysLeft} {t("day")}
                {trialDaysLeft === 1 ? "" : "s"} {t("left")})
              </span>
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
          {t("trial_expired")}{" "}
          <strong>{trialEndDate.toLocaleDateString()}</strong>
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

          {!hasActiveTrial && (
            <SettingButton
              variant="primary"
              className="mt-3"
              onClick={handleManageSubscription}
            >
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
          <SettingButton
            variant="success"
            onClick={() => navigate("/premium")}
          >
            {t("upgrade_premium")}
          </SettingButton>
        )}
      </div>
    );
  };

  /* ------------------------------------------------------------------ */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-4 pb-2">
      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 mt-2">
          {t("settings_title") || "Settings"}
        </h1>
        <p className="text-sm text-gray-900 dark:text-gray-500 mt-1">Customize your app experience</p>
      </div>

      {/* ACCOUNT INFO */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Account Info
        </h2>
        <Card className="space-y-1">
          <SettingsRow
            icon={<GlobeAltIcon className="w-6 h-6" />}
            title="Account"
            description={user?.email}
          />
        </Card>
      </section>

      {/* ===================== PREFERENCES ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Preferences
        </h2>
        <Card className="space-y-1">
          <SettingsRow
            icon={<GlobeAltIcon className="w-6 h-6" />}
            title="Base Currency"
            description={`${currency} – ${CURRENCY_LABELS[currency] ?? "Unknown currency"}`}
            onClick={() => setActiveSheet("currency")}
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {/* Appearance */}
          <SettingsRow
            icon={<MoonIcon className="w-6 h-6" />}
            title="Appearance"
            description={isDark ? "Dark mode" : "Light mode"}
            right={
              <ThemeSwitch
                checked={isDark}
                onChange={toggleTheme}
              />
            }
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {/* Language */}
          <SettingsRow
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Language"
            description={
              currentLang
                ? `${currentLang.emoji} ${currentLang.label}`
                : i18n.language
            }
            onClick={() => setActiveSheet("language")}
          />
          {/* <div className="h-px bg-gray-200 dark:bg-gray-700 mx-1" /> */}

          {/* <SettingsRow
            icon={<TagIcon className="w-6 h-6" />}
            title="Manage Categories"
            description="Create custom categories"
            premium
            onClick={() => navigate("/settings/categories")}
          /> */}
        </Card>
      </section>

      {/* ===================== DATA MANAGEMENT ===================== */}
      {/* ===================== DATA MANAGEMENT ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Data Management
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download subscriptions"
            description="Export all subscriptions as CSV"
            onClick={() => exportSubscriptionsCSV(subscriptions)}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download payment history"
            description="Export all past payments as CSV"
            premium
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download annual summary"
            description="Yearly totals per subscription"
            premium
            onClick={() => exportAnnualSummaryCSV(subscriptions)}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Full data export"
            description="Download everything (JSON)"
            onClick={() =>
              exportFullJSON({
                user,
                subscriptions,
                settings: {
                  currency,
                  theme,
                  language: i18n.language,
                },
              })
            }
          />
        </Card>

        <p className="text-xs text-gray-400 mt-2 px-2">
          You can export or delete your data at any time.
        </p>
      </section>


      {/* ===================== PRIVACY & SECURITY ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Privacy & Security
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<ShieldCheckIcon className="w-6 h-6" />}
            title="Privacy Policy"
            description="How we collect, process and protect your data (GDPR)"
            to="/datenschutz" />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title="Legal Notice (Impressum)"
            description="Company information and legal disclosure"
            to="/impressum" />
          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title="Terms & Conditions (AGB)"
            description="Legal terms for using Trakio"
            to="/agb"
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title="Widerrufsbelehrung"
            description="Informationen zum Widerrufsrecht"
            to="/widerruf"
          />

        </Card>
      </section>

      {/* ===================== SUPPORT ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Support
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<QuestionMarkCircleIcon className="w-6 h-6" />}
            title="Help & Support"
            description="Get help and find answers"
            href="mailto:support@trakio.de"
          />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<StarIcon className="w-6 h-6" />}
            title="Rate Trakio"
            description="Help us improve with your feedback"
            href="https://example.com"
          />

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

          <SettingsRow
            icon={<ShareIcon className="w-6 h-6" />}
            title="Share Trakio"
            description="Share with friends and family"
            href="https://trakio.de"
          />
        </Card>
      </section>

      {/* TRIAL INFO */}
      <Card>
        <h2 className="text-sm font-semibold mb-2">
          {t("trial_status")}
        </h2>
        {renderTrialContent()}
      </Card>

      {/* PREMIUM STATUS */}
      <SubscriptionStatusCard />

      {/* LOGOUT + BACK */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton variant="danger" onClick={logout}>
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
