import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";
import SubscriptionStatusCard from "../components/premium/SubscriptionStatusCard";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../hooks/useTheme";
import { MoonIcon, LanguageIcon, DocumentTextIcon, StarIcon, ShareIcon, UserCircleIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import ThemeSwitch from "../components/ui/ThemeSwitch";
import { startTransition } from "react";
// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import SettingsRow from "../components/ui/SettingsRow";
import languages from "../utils/languages";

import {
  GlobeAltIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { CURRENCY_LABELS } from "../utils/currencyLabels";
import {
  exportSubscriptionsCSV,
  exportAnnualSummaryCSV,
  exportFullJSON,
} from "../utils/exportData";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";
import SectionHeader from "../components/ui/SectionHeader";

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

  const handleRate = () => {
    window.open("https://trakio.de", "_blank");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Trakio",
      text: "I use Trakio to track all my subscriptions. Try it!",
      url: "https://trakio.de",
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard");
    }
  };

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
  // const handleStartTrial = async () => {
  //   const success = await startTrial();
  //   if (success) alert("Trial started successfully.");
  // };

  // const handleCancelTrial = async () => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to cancel your trial?"
  //   );
  //   if (!confirmed) return;

  //   const success = await cancelTrial();
  //   if (success) alert("Trial cancelled.");
  // };

  // const renderTrialContent = () => {
  //   if (hasActiveTrial && trialEndDate) {
  //     return (
  //       <div className="flex flex-col gap-2">
  //         <p className="text-sm text-gray-700 dark:text-gray-300">
  //           {t("trial_end")}{" "}
  //           <strong>{trialEndDate.toLocaleDateString()}</strong>
  //           {trialDaysLeft !== null && (
  //             <span>
  //               {" "}
  //               ({trialDaysLeft} {t("day")}
  //               {trialDaysLeft === 1 ? "" : "s"} {t("left")})
  //             </span>
  //           )}
  //         </p>
  //         <SettingButton variant="danger" onClick={handleCancelTrial}>
  //           {t("cancel_trial")}
  //         </SettingButton>
  //       </div>
  //     );
  //   }

  //   if (trialExpired && trialEndDate) {
  //     return (
  //       <p className="text-sm text-gray-700 dark:text-gray-300">
  //         {t("trial_expired")}{" "}
  //         <strong>{trialEndDate.toLocaleDateString()}</strong>
  //       </p>
  //     );
  //   }

  //   if (noTrial) {
  //     return (
  //       <SettingButton variant="success" onClick={handleStartTrial}>
  //         {t("start_seven_days")}
  //       </SettingButton>
  //     );
  //   }

  //   if (isPremium) {
  //     return (
  //       <p className="text-sm text-gray-700 dark:text-gray-300">
  //         {t("no_info")}
  //       </p>
  //     );
  //   }

  //   return null;
  // };

  /* ------------------------------------------------------------------ */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-4 pb-2">
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-250">{t("settings_title") || "Settings"}</h1>

      {/* PREMIUM STATUS */}
      <section>
        <SubscriptionStatusCard />


        {/* TRIAL INFO */}
        {/* <Card className="space-y-1 mt-2">
          <h2 className="text-sm font-semibold mb-2">
            {t("trial_status")}
          </h2>
          {renderTrialContent()}
        </Card> */}
      </section>

      {/* ACCOUNT INFO */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Account Info
        </h2>
        <Card className="space-y-1">
          <SettingsRow
            icon={<UserCircleIcon className="w-6 h-6" />}
            title="Account"
            description={user?.email}
            accent="indigo"
            glow
          />
        </Card>
      </section>

      {/* ===================== PREFERENCES ===================== */}
      <section>
        <SectionHeader
          title="Preferences"
          subtitle="Customize your app experience"
        />
        <Card className="space-y-1">
          <SettingsRow
            icon={<GlobeAltIcon className="w-6 h-6" />}
            title="Base Currency"
            glow
            description={`${currency} – ${CURRENCY_LABELS[currency] ?? "Unknown currency"}`}
            onClick={() => {
              startTransition(() => {
                setActiveSheet("currency");
              });
            }}
          />

          {/* Appearance */}
          <SettingsRow
            icon={<MoonIcon className="w-6 h-6" />}
            title="Appearance"
            glow
            description={isDark ? "Dark mode" : "Light mode"}
            right={
              <ThemeSwitch
                checked={isDark}
                onChange={toggleTheme}
              />
            }
            accent="orange"
          />

          {/* Language */}
          <SettingsRow
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Language"
            glow
            description={
              currentLang
                ? `${currentLang.emoji} ${currentLang.label}`
                : i18n.language
            }
            onClick={() => {
              startTransition(() => {
                setActiveSheet("language");
              });
            }}
          />
        </Card>
      </section>

      {/* ===================== DATA MANAGEMENT ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Data Management
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download subscriptions"
            // premium
            glow
            description="Export all subscriptions as CSV"
            onClick={() => exportSubscriptionsCSV(subscriptions)}
            accent="blue"
          />


          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download payment history"
            description="Export all past payments as CSV"
            // premium
            glow
            accent="blue"
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
          />


          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Download annual summary"
            description="Yearly totals per subscription"
            // premium
            glow
            accent="blue"
            onClick={() => exportAnnualSummaryCSV(subscriptions)}
          />


          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title="Full data export"
            accent="blue"
            // premium
            glow
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
            glow
            description="How we collect, process and protect your data (GDPR)"
            to="/datenschutz"
            accent="green" />

          <SettingsRow
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            title="Legal Notice (Impressum)"
            description="Company information and legal disclosure"
            to="/impressum"
            glow
            accent="green" />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title="Terms & Conditions (AGB)"
            description="Legal terms for using Trakio"
            to="/agb"
            glow
            accent="green"
          />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title="Widerrufsbelehrung"
            description="Informationen zum Widerrufsrecht"
            to="/widerruf"
            glow
            accent="green"
          />
        </Card>
      </section>

      {/* ===================== HELP & SUPPORT ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          Help & Support
        </h2>
        {/* Intro */}
        <Card className="space-y-1">
          <SettingsRow
            icon={<QuestionMarkCircleIcon className="w-6 h-6" />}
            title="Help & Support"
            description="FAQs and contact support"
            accent="purple"
            glow
            onClick={() => {
              startTransition(() => {
                setActiveSheet("help");
              });
            }}
          />

          <SettingsRow
            icon={<StarIcon className="w-6 h-6" />}
            title="Rate Trakio"
            description="Help us improve by leaving a review"
            onClick={handleRate}
            accent="purple"
            glow
          />

          <SettingsRow
            icon={<ShareIcon className="w-6 h-6" />}
            title="Share Trakio"
            description="Share Trakio with friends and family"
            onClick={handleShare}
            accent="purple"
            glow
          />

        </Card>
      </section>

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
