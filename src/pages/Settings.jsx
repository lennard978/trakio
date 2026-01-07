import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
// import { usePremium } from "../hooks/usePremium";
import SubscriptionStatusCard from "../components/premium/SubscriptionStatusCard";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../hooks/useTheme";
import {
  MoonIcon,
  LanguageIcon,
  DocumentTextIcon,
  ShareIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  TrashIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import ThemeSwitch from "../components/ui/ThemeSwitch";
import { startTransition } from "react";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import SettingsRow from "../components/ui/SettingsRow";
import languages from "../utils/languages";
import { persistSubscriptions } from "../utils/persistSubscriptions";
import { loadSubscriptionsLocal } from "../utils/mainDB";
import { toast } from "react-hot-toast";

import { CURRENCY_LABELS } from "../utils/currencyLabels";
import {
  exportSubscriptionsCSV,
  exportAnnualSummaryCSV,
  exportFullJSON,
} from "../utils/exportData";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";
import SectionHeader from "../components/ui/SectionHeader";
import { clearAllLocalData } from "../utils/mainDB";

/* -------------------- Helpers (SSR-safe) -------------------- */

function isBrowser() {
  return typeof window !== "undefined";
}

function isOnline() {
  return isBrowser() && typeof navigator !== "undefined" && navigator.onLine;
}

function safeGetToken() {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function safeUUID() {
  if (isBrowser() && typeof crypto !== "undefined" && crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Settings({ setActiveSheet }) {
  const { user, logout, loading } = useAuth();
  // const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  // const premium = usePremium();
  const { currency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const currentLang = languages.find((l) => l.code === i18n.language);

  const [subscriptions, setSubscriptions] = useState([]);
  const [importPreview, setImportPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

  /* -------------------- Auth guards -------------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        {t("loading") || "Loading..."}
      </div>
    );
  }

  if (!user?.email) {
    return (
      <p className="text-center mt-10 text-gray-500">
        {t("not_logged_in") || "You are not logged in."}
      </p>
    );
  }

  /* -------------------- Rate / Share -------------------- */

  // const handleRate = () => {
  //   if (!isBrowser()) return;
  //   window.open("https://trakio.de", "_blank");
  // };

  const handleShare = async () => {
    if (!isBrowser()) return;

    const shareData = {
      title: "Trakio",
      text: "I use Trakio to track all my subscriptions. Try it!",
      url: "https://trakio.de",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard");
      }
    } catch {
      // user cancelled share – no need to show error
    }
  };

  /* -------------------- Load subscriptions (local first) -------------------- */

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    (async () => {
      try {
        // 1️⃣ Always load local first (offline-safe)
        const local = await loadSubscriptionsLocal();
        if (!cancelled && Array.isArray(local) && local.length) {
          setSubscriptions(local);
        }
      } catch (err) {
        console.warn("Settings: local load failed", err);
      }

      // 2️⃣ Fetch remote only if online
      if (isOnline()) {
        try {
          const token = safeGetToken();
          if (!token) return;

          const res = await fetch("/api/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "get",
              email: user.email,
            }),
          });

          const data = await res.json();

          if (
            !cancelled &&
            Array.isArray(data.subscriptions) &&
            data.subscriptions.length > 0
          ) {
            setSubscriptions(data.subscriptions);
          } else {
            console.warn("Settings: remote empty, keeping local");
          }
        } catch (err) {
          console.warn("Settings: failed to fetch remote subscriptions", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  /* -------------------- CSV parsing -------------------- */

  function parseCSV(text) {
    const lines = String(text || "").trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());

    return lines.slice(1).map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }

      values.push(current);

      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i]?.trim().replace(/^"|"$/g, "");
      });

      // Normalize data (keep your conventions)
      const amount = parseFloat(obj.amount) || 0;
      const payDate = obj.paymentDate || obj.datePaid || obj.date || "";

      return {
        ...obj,
        id: obj.id || safeUUID(),
        name: obj.name || obj.subscription || "",
        category: (obj.category || "other").toLowerCase(),
        currency: obj.currency || "EUR",
        method: obj.method || "",
        notify: obj.notify !== "false",
        price: amount,
        color: obj.color || "rgba(255,255,255,0.9)",
        payments: [
          {
            id: safeUUID(),
            amount,
            date: payDate,
            currency: obj.currency || "EUR",
          },
        ],
      };
    });
  }

  /* -------------------- Import CSV -------------------- */

  const handleImportCSV = async (file) => {
    if (!file) return;

    const text = await file.text();
    const parsed = parseCSV(text);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      alert("Invalid or empty CSV file");
      return;
    }

    const token = safeGetToken();
    if (!token) {
      alert("Please log in again.");
      return;
    }

    // 🔁 Refetch subscriptions from backend (avoid stale state)
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", email: user.email }),
    });

    const backend = await res.json();
    const current = Array.isArray(backend.subscriptions)
      ? backend.subscriptions
      : [];

    // 🔍 Duplicate detection by payments (your approach)
    const existingPaymentIndex = new Set();

    current.forEach((s) => {
      (s.payments || []).forEach((p) => {
        if (!p?.date) return;
        const d = new Date(p.date);
        if (Number.isNaN(d.getTime())) return;

        const key = [
          s.name,
          d.toISOString().slice(0, 10),
          Number(p.amount).toFixed(2),
          p.currency || s.currency || "EUR",
        ].join("|");

        existingPaymentIndex.add(key);
      });
    });

    let duplicateCount = 0;

    const cleaned = parsed
      .map((s) => {
        const uniquePayments = [];

        (s.payments || []).forEach((p) => {
          if (!p?.date) return;
          const d = new Date(p.date);
          if (Number.isNaN(d.getTime())) return;

          const key = [
            s.name,
            d.toISOString().slice(0, 10),
            Number(p.amount).toFixed(2),
            p.currency || s.currency || "EUR",
          ].join("|");

          if (existingPaymentIndex.has(key)) {
            duplicateCount++;
          } else {
            uniquePayments.push(p);
          }
        });

        return { ...s, payments: uniquePayments };
      })
      .filter((s) => (s.payments || []).length > 0);

    if (cleaned.length === 0) {
      alert("Nothing new to import (all payments were duplicates)");
      return;
    }

    setImportFile(cleaned);
    setImportPreview({
      subscriptions: cleaned.length,
      payments: cleaned.reduce((sum, s) => sum + (s.payments?.length || 0), 0),
      duplicates: duplicateCount,
      sample: cleaned.slice(0, 3),
    });
  };

  /* ------------------------------------------------------------------
   * Budget state (kept as in your file)
   * ------------------------------------------------------------------ */

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    if (!isBrowser()) return null;
    const saved = localStorage.getItem("monthly_budget");
    return saved ? Number(saved) : null;
  });

  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(() => {
    if (!isBrowser()) return false;
    return localStorage.getItem("budget_alerts_enabled") === "1";
  });

  useEffect(() => {
    if (!isBrowser()) return;

    try {
      if (monthlyBudget == null) {
        localStorage.removeItem("monthly_budget");
      } else {
        localStorage.setItem("monthly_budget", String(monthlyBudget));
      }

      localStorage.setItem(
        "budget_alerts_enabled",
        budgetAlertsEnabled ? "1" : "0"
      );
    } catch {
      // ignore storage failures
    }
  }, [monthlyBudget, budgetAlertsEnabled]);

  /* ------------------------------------------------------------------
   * Stripe Customer Portal (kept)
   * ------------------------------------------------------------------ */

  // const handleManageSubscription = async () => {
  //   const token = safeGetToken();

  //   if (!token) {
  //     alert("Please log in again.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch("/api/stripe", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ action: "portal" }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data?.error || "Failed to open customer portal");
  //     }

  //     if (data?.url && isBrowser()) {
  //       window.location.href = data.url;
  //     }
  //   } catch {
  //     alert("Unable to open customer portal.");
  //   }
  // };

  /* -------------------- Delete all subscriptions (FIXED) -------------------- */

  const handleDeleteAllSubscriptions = async () => {
    if (
      !confirm(
        t("settings_delete_all_subs_confirm") ||
        "Are you sure you want to delete all subscriptions?"
      )
    )
      return;

    try {
      await persistSubscriptions({
        email: user.email,
        token: safeGetToken(),
        subscriptions: [],
      });

      setSubscriptions([]);
      toast.success("✅ All subscriptions deleted successfully.");
    } catch (e) {
      console.error("Delete all failed:", e);
      toast.error("Failed to delete subscriptions.");
    }
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-4 pb-2">
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-250">
        {t("settings_title") || "Settings"}
      </h1>

      {/* PREMIUM STATUS */}
      <section>
        <SubscriptionStatusCard />
      </section>

      {/* ACCOUNT INFO */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          {t("settings_section_account_info") || "Account Information"}
        </h2>
        <Card className="space-y-1">
          <SettingsRow
            icon={<UserCircleIcon className="w-6 h-6" />}
            title={t("settings_account") || "Account"}
            description={user?.email}
            accent="indigo"
            glow
          />
        </Card>
      </section>

      {/* ===================== PREFERENCES ===================== */}
      <section>
        <SectionHeader
          title={t("settings_section_preferences") || "Preferences"}
          subtitle={
            t("settings_section_preferences_desc") || "Customize your experience"
          }
        />
        <Card className="space-y-1">
          <SettingsRow
            icon={<GlobeAltIcon className="w-6 h-6" />}
            title={t("settings_currency") || "Currency"}
            glow
            description={`${currency} – ${CURRENCY_LABELS[currency] ?? "Unknown currency"
              }`}
            onClick={() => {
              startTransition(() => {
                setActiveSheet("currency");
              });
            }}
          />

          {/* Appearance */}
          <SettingsRow
            icon={<MoonIcon className="w-6 h-6" />}
            title={t("settings_appearance") || "Appearance"}
            glow
            description={t(isDark ? "theme.dark" : "theme.light")}
            right={<ThemeSwitch checked={isDark} onChange={toggleTheme} />}
            accent="orange"
          />

          {/* Language */}
          <SettingsRow
            icon={<LanguageIcon className="w-6 h-6" />}
            title={t("settings_language") || "Language"}
            glow
            description={
              currentLang ? `${currentLang.emoji} ${currentLang.label}` : i18n.language
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
        <SectionHeader
          title={t("settings_section_data_management") || "Data Management"}
          subtitle={
            t("settings_section_data_management_desc") ||
            "You can export or delete your data at any time."
          }
        />
        <Card className="space-y-1">
          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title={t("settings_export_subs") || "Download subscriptions"}
            glow
            description={t("settings_export_subs_desc") || "Export all subscriptions as CSV"}
            onClick={() => {
              if (!subscriptions.length) {
                alert(t("no_data_to_export") || "No subscriptions to export.");
                return;
              }
              exportSubscriptionsCSV(subscriptions);
            }}
            accent="blue"
          />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title={t("settings_export_history") || "Download payment history"}
            description={t("settings_export_history_desc") || "Export all past payments as CSV"}
            glow
            accent="blue"
            onClick={() => {
              if (!subscriptions.length) {
                alert(t("no_data_to_export") || "No payment history to export.");
                return;
              }
              exportPaymentHistoryCSV(subscriptions);
            }}
          />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title={t("settings_export_summary") || "Download annual summary"}
            description={t("settings_export_summary_desc") || "Yearly totals per subscription"}
            glow
            accent="blue"
            onClick={() => {
              if (!subscriptions.length) {
                alert(t("no_data_to_export") || "No annual history to export.");
                return;
              }
              exportAnnualSummaryCSV(subscriptions);
            }}
          />

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title={t("settings_export_all") || "Download full data"}
            accent="blue"
            glow
            description={
              t("settings_export_all_desc") ||
              "All your subscriptions, payments and settings as JSON"
            }
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

          <SettingsRow
            icon={<ArrowDownTrayIcon className="w-6 h-6" />}
            title={t("settings_import_subs") || "Import subscriptions"}
            description={t("settings_import_subs_desc") || "Upload CSV with subscriptions"}
            glow
            accent="blue"
            onClick={() => fileInputRef.current?.click()}
          />

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleImportCSV(e.target.files?.[0])}
          />

          <SettingsRow
            icon={<TrashIcon className="w-6 h-6" />}
            title={t("settings_delete_all_subs") || "Delete all subscriptions"}
            description={
              t("settings_delete_all_subs_desc") ||
              "Permanently delete all your subscriptions"
            }
            accent="red"
            glow
            onClick={handleDeleteAllSubscriptions}
          />
        </Card>
      </section>

      {/* ===================== PRIVACY & SECURITY ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          {t("settings_section_privacy") || "Privacy & Security"}
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<ShieldCheckIcon className="w-6 h-6" />}
            title={t("settings_privacy_policy") || "Privacy Policy"}
            glow
            description={
              t("settings_privacy_desc") ||
              "How we collect, process and protect your data (GDPR)"
            }
            to="/datenschutz"
            accent="green"
          />

          <SettingsRow
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            title={t("settings_impressum") || "Legal Notice (Impressum)"}
            description={t("settings_impressum_desc") || "Company information and legal disclosure"}
            to="/impressum"
            glow
            accent="green"
          />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title={t("settings_terms") || "Terms & Conditions (AGB)"}
            description={t("settings_terms_desc") || "Legal terms for using Trakio"}
            to="/agb"
            glow
            accent="green"
          />

          <SettingsRow
            icon={<DocumentTextIcon className="w-6 h-6" />}
            title={t("withdrawal.title")}
            description={t("withdrawal.description")}
            to="/widerruf"
            glow
            accent="green"
          />

          <SettingsRow
            icon={<TrashIcon className="w-6 h-6 text-red-500" />}
            title={t("settings_delete_account") || "Delete account permanently"}
            description={
              t("settings_delete_account_desc") ||
              "This will permanently delete your account and all associated data."
            }
            accent="red"
            glow
            onClick={async () => {
              const confirmed = window.confirm(
                "This will permanently delete your Trakio account and all personal data.\n\n" +
                "Active subscriptions will be cancelled.\n" +
                "This action is irreversible.\n\n" +
                "Do you want to proceed?"
              );

              if (!confirmed) return;

              try {
                const token = safeGetToken();

                const res = await fetch("/api/user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ action: "delete-account" }),
                });

                if (!res.ok) {
                  toast.error("Failed to delete account. Please contact support.");
                  return;
                }

                await clearAllLocalData();
                toast.success("Account deleted successfully");

                if (isBrowser()) {
                  window.location.replace("/account-deleted");
                }
              } catch {
                toast.error("Unexpected error. Please try again.");
              }
            }}
          />
        </Card>
      </section>

      {/* ===================== HELP & SUPPORT ===================== */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
          {t("settings_section_support") || "Help & Support"}
        </h2>

        <Card className="space-y-1">
          <SettingsRow
            icon={<QuestionMarkCircleIcon className="w-6 h-6" />}
            title={t("settings_section_support") || "Help & Support"}
            description={t("settings_help_desc") || "FAQs and contact support"}
            accent="purple"
            glow
            onClick={() => {
              startTransition(() => {
                setActiveSheet("help");
              });
            }}
          />

          {/*
          <SettingsRow
            icon={<StarIcon className="w-6 h-6" />}
            title={t("settings_rate") || "Rate Trakio"}
            description={t("settings_rate_desc") || "Help us improve by leaving a review"}
            onClick={handleRate}
            accent="purple"
            glow
          />
          */}

          <SettingsRow
            icon={<ShareIcon className="w-6 h-6" />}
            title={t("settings_share") || "Share Trakio"}
            description={t("settings_share_desc") || "Share Trakio with friends and family"}
            onClick={handleShare}
            accent="purple"
            glow
          />
        </Card>
      </section>

      {/* LOGOUT */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton variant="danger" onClick={logout}>
            {t("settings_logout") || "Log Out"}
          </SettingButton>
        </div>
      </Card>

      {/* -------------------- Import Preview Modal -------------------- */}
      {importPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {t("import_preview_title") || "Import Preview"}
            </h3>

            <div className="text-sm space-y-1 mb-3 text-gray-700 dark:text-gray-300">
              <div>
                {t("import_preview_subscriptions") || "Subscriptions"}:{" "}
                <b>{importPreview.subscriptions}</b>
              </div>
              <div>
                {t("import_preview_payments") || "Payments"}:{" "}
                <b>{importPreview.payments}</b>
              </div>
              {importPreview.duplicates > 0 && (
                <div className="text-orange-600 dark:text-orange-400">
                  {t("import_preview_duplicates") || "Duplicates"}:{" "}
                  <b>{importPreview.duplicates}</b>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setImportPreview(null);
                  setImportFile(null);
                }}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {t("cancel") || "Cancel"}
              </button>

              <button
                onClick={async () => {
                  const token = safeGetToken();

                  try {
                    // Merge current subs + imported file
                    const next = [
                      ...(Array.isArray(subscriptions) ? subscriptions : []),
                      ...(Array.isArray(importFile) ? importFile : []),
                    ];

                    await persistSubscriptions({
                      email: user.email,
                      token,
                      subscriptions: next,
                    });

                    setSubscriptions(next);

                    alert(
                      t("import_success_message") === "import_success_message"
                        ? "Import successful!"
                        : t("import_success_message")
                    );
                  } catch {
                    alert(t("import_failed_message") || "Import failed. Please try again.");
                  }

                  setImportPreview(null);
                  setImportFile(null);
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {t("confirm_import") || "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- PropTypes -------------------- */

Settings.propTypes = {
  setActiveSheet: PropTypes.func.isRequired,
};
