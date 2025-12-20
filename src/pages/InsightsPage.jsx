// src/pages/InsightsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { forecastSpend } from "../utils/forecast";
import useBudgetAlerts from "../hooks/useBudgetAlerts";
import { getCurrencyFlag } from "../utils/currencyFlags";

import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";
import { useCurrency } from "../context/CurrencyContext"; // ✅ Currency context
import { convert } from "../utils/currency"; // ✅ Currency converter

import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import BudgetOverviewChart from "../components/insights/BudgetOverviewChart";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";
import PremiumGuard from "../components/premium/PremiumGuard";

/* ------------------------------------------------------------------ */
const FREQ = {
  weekly: { monthlyFactor: 4.345 },
  biweekly: { monthlyFactor: 2.1725 },
  monthly: { monthlyFactor: 1 },
  quarterly: { monthlyFactor: 1 / 3 },
  semiannual: { monthlyFactor: 1 / 6 },
  nine_months: { monthlyFactor: 1 / 9 },
  yearly: { monthlyFactor: 1 / 12 },
  biennial: { monthlyFactor: 1 / 24 },
  triennial: { monthlyFactor: 1 / 36 },
};
/* ------------------------------------------------------------------ */

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email;
  const premium = usePremium();
  const { currency } = useCurrency(); // ✅ Access target currency

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const monthlyBudget = Number(localStorage.getItem("monthly_budget"));

  /* ---------------- Premium gate ---------------- */
  useEffect(() => {
    if (premium.loaded && !premium.isPremium) {
      navigate("/dashboard");
    }
  }, [premium.loaded, premium.isPremium, navigate]);

  /* ---------------- Load from KV ---------------- */
  useEffect(() => {
    if (!email) return;

    (async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "get", email }),
        });

        const data = await res.json();
        setSubscriptions(
          Array.isArray(data.subscriptions) ? data.subscriptions : []
        );
      } catch (err) {
        console.error("Insights load error:", err);
      }
    })();
  }, [email]);

  /* ---------------- Monthly normalized cost ---------------- */
  const monthlyCost = (s) => {
    const cfg = FREQ[s.frequency] || FREQ.monthly;
    const base = s.currency || "EUR";

    const converted = rates
      ? convert(s.price, base, currency, rates) // ✅ CORRECT USAGE
      : s.price;

    return converted * cfg.monthlyFactor;
  };

  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + monthlyCost(s),
    0
  );

  /* ---------------- Forecast ---------------- */
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const forecast30 = useMemo(() => {
    if (!rates) return null;
    return forecastSpend({
      subscriptions,
      fromDate: now,
      toDate: new Date(now.getTime() + 30 * 86400000),
      rates,
      convert: (amount, from) => convert(amount, from, currency, rates), // ✅ inline convert using selected currency
    });
  }, [subscriptions, rates, now, currency]); // ✅ include currency

  useBudgetAlerts({
    forecast30,
    isPremium: premium.isPremium,
  });

  /* ---------------- Top category ---------------- */
  const categoryTotals = subscriptions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + monthlyCost(s);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    t("none");

  /* ---------------- Most expensive ---------------- */
  const highestSub = useMemo(() => {
    if (!subscriptions.length) return null;
    return subscriptions.reduce((a, b) =>
      monthlyCost(b) > monthlyCost(a) ? b : a
    );
  }, [subscriptions, rates, currency]); // ✅ include currency

  const highestSubMonthly = highestSub ? monthlyCost(highestSub) : 0;

  /* ---------------- Most common frequency ---------------- */
  const freqCount = subscriptions.reduce((acc, s) => {
    acc[s.frequency] = (acc[s.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreq =
    Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  /* ---------------- Reports summary metrics ---------------- */

  const totalAnnual = useMemo(() => {
    return totalMonthly * 12;
  }, [totalMonthly]);

  const activeSubs = subscriptions.length;

  const avgPerSub = useMemo(() => {
    if (!activeSubs) return 0;
    return totalMonthly / activeSubs;
  }, [totalMonthly, activeSubs]);

  const [importPreview, setImportPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const existingPaymentIndex = useMemo(() => {
    const set = new Set();

    subscriptions.forEach((s) => {
      if (!Array.isArray(s.payments)) return;

      s.payments.forEach((p) => {
        const key = [
          s.name,
          new Date(p.date).toISOString().slice(0, 10),
          Number(p.amount).toFixed(2),
          p.currency || s.currency || "EUR",
        ].join("|");

        set.add(key);
      });
    });

    return set;
  }, [subscriptions]);


  const handleImportCSV = async (file) => {
    if (!file) return;

    const text = await file.text();
    const parsed = parseCSV(text);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      alert("Invalid or empty CSV file");
      return;
    }

    let duplicateCount = 0;

    const cleaned = parsed
      .map((s) => {
        const uniquePayments = [];

        s.payments.forEach((p) => {
          const key = [
            s.name,
            new Date(p.date).toISOString().slice(0, 10),
            Number(p.amount).toFixed(2),
            p.currency || s.currency || "EUR",
          ].join("|");

          if (existingPaymentIndex.has(key)) {
            duplicateCount++;
          } else {
            uniquePayments.push(p);
          }
        });

        return {
          ...s,
          payments: uniquePayments,
        };
      })
      .filter((s) => s.payments.length > 0);

    if (cleaned.length === 0) {
      alert("Nothing new to import (all payments were duplicates)");
      return;
    }

    setImportFile(cleaned);
    setImportPreview({
      subscriptions: cleaned.length,
      payments: cleaned.reduce((sum, s) => sum + s.payments.length, 0),
      duplicates: duplicateCount,
      sample: cleaned.slice(0, 3),
    });
  };



  function parseCSV(text) {
    const lines = text
      .replace(/\r/g, "")   // 🔥 FIX WINDOWS CSV
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());

    const rows = lines.slice(1).map(row => {
      const values = row.split(",").map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? "";
      });
      return obj;
    });

    const subsMap = {};

    rows.forEach((row) => {
      const name = row.name || "Imported subscription";

      if (!subsMap[name]) {
        subsMap[name] = {
          id: crypto.randomUUID(),
          name,
          frequency: row.frequency || "monthly",
          currency: row.currency || "EUR",
          category: row.category || "Uncategorized",
          method: row.method || "Unknown",
          price: Number(row.price || row.amount || 0),
          payments: [],
        };
      }

      if (row.paymentDate || row.datePaid) {
        const date = row.paymentDate || row.datePaid;
        const amount = Number(row.amount || row.price || 0);

        subsMap[name].payments.push({
          id: crypto.randomUUID(),
          date,
          amount,
          currency: row.currency || subsMap[name].currency,
        });

        subsMap[name].price = amount;
      }
    });

    return Array.isArray(Object.values(subsMap))
      ? Object.values(subsMap)
      : [];
  }


  return (
    <div className="max-w-4xl mx-auto p-2 pb-6 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("insights_title")}
      </h1>

      {premium.isPremium &&
        forecast30 &&
        monthlyBudget &&
        forecast30.total > monthlyBudget && (
          <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm text-center">
            {t("budget_exceeded", {
              spend: forecast30.total.toFixed(2),
              budget: monthlyBudget.toFixed(2),
            })}
          </div>
        )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ================= REPORTS SUMMARY ================= */}
        <div className="grid grid-cols-2 gap-4 mb-1">

          {/* Monthly Spend */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 text-black rounded-xl bg-purple-100 flex items-center justify-center text-xl">
                {getCurrencyFlag(currency)}
              </div>
            </div>
            <div className="text-2xl font-bold">
              {currency} {totalMonthly.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {t("monthly_spend")}
            </div>
            <div className="text-xs text-gray-400">
              {t("active_subscriptions")} ({currency})
            </div>
          </Card>

          {/* Annual Cost */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {currency} {totalAnnual.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {t("annual_cost")}
            </div>
            <div className="text-xs text-gray-400">
              {t("projected_yearly")} ({currency})
            </div>
          </Card>

          {/* Active Subs */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {activeSubs}
            </div>
            <div className="text-sm text-gray-500">
              {t("active_subs")}
            </div>
            <div className="text-xs text-gray-400">
              {t("of_total", { count: activeSubs })}
            </div>
          </Card>

          {/* Avg per Sub */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {currency} {avgPerSub.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {t("avg_per_sub")}
            </div>
            <div className="text-xs text-gray-400">
              {t("monthly_average")} ({currency})
            </div>
          </Card>

        </div>
        {/* ================= END REPORTS SUMMARY ================= */}

      </div>

      {/* ---------------- Payment history ---------------- */}
      <Card className="mt-6 p-5">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {t("insights_payment_history")}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="border-b">
                <th>Subscription</th>
                <th>Frequency</th>
                <th>Payments</th>
                <th>Dates</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => {
                const payments = (() => {
                  if (Array.isArray(s.payments)) return s.payments;

                  const list = [];

                  if (Array.isArray(s.history)) {
                    s.history.forEach((d) => {
                      list.push({
                        date: d,
                        amount: s.price,
                        currency: s.currency || "EUR",
                      });
                    });
                  }

                  if (s.datePaid) {
                    list.push({
                      date: s.datePaid,
                      amount: s.price,
                      currency: s.currency || "EUR",
                    });
                  }

                  return list;
                })();

                const totalPaid = payments.reduce((sum, p) => {
                  const converted = rates
                    ? convert(p.amount, p.currency, currency, rates) // ✅ CORRECT
                    : p.amount;
                  return sum + converted;
                }, 0);

                return (
                  <tr key={s.id} className="border-b text-center">
                    <td className="font-medium">{s.name}</td>
                    <td>{t(`frequency_${s.frequency}`)}</td>
                    <td>{payments.length}</td>
                    <td>
                      {payments
                        .map((p) => new Date(p.date).toLocaleDateString())
                        .join(", ")}
                    </td>
                    <td>{`${currency} ${totalPaid.toFixed(2)}`}</td>
                  </tr>

                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="w-full bg-gray-200 dark:bg-gray-800 py-2 rounded-xl font-medium"
          >
            Import CSV
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              handleImportCSV(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>


      </Card>

      <PremiumGuard>
        <BudgetOverviewChart
          subscriptions={subscriptions}
          rates={rates}
        />
      </PremiumGuard>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-4 px-4 py-2 rounded-xl border"
      >
        ← {t("button_back")}
      </button>

      {/* ================= IMPORT PREVIEW MODAL ================= */}
      {importPreview && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Import CSV Preview
            </h3>

            <div className="text-sm space-y-1 mb-3">
              <div>Subscriptions: <b>{importPreview.subscriptions}</b></div>
              <div>Payments: <b>{importPreview.payments}</b></div>

              {importPreview.duplicates > 0 && (
                <div className="text-orange-600">
                  Duplicates skipped: <b>{importPreview.duplicates}</b>
                </div>
              )}
            </div>


            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setImportPreview(null);
                  setImportFile(null);
                }}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={confirmImport}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= END IMPORT PREVIEW ================= */}

    </div>
  );
}

/* ------------------------------------------------------------------ */
function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600" />
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </Card>
  );
}
