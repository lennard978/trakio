// src/pages/InsightsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { forecastSpend } from "../utils/forecast";
import useBudgetAlerts from "../hooks/useBudgetAlerts";

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
        <InsightsCard
          title={t("dashboard_total_monthly")}
          value={`${currency} ${totalMonthly.toFixed(2)}`} // ✅ show currency
          Icon={CurrencyEuroIcon}
        />

        <InsightsCard
          title={t("dashboard_top_category")}
          value={topCategory}
          Icon={TagIcon}
        />

        <InsightsCard
          title={t("dashboard_highest_sub")}
          value={
            highestSub
              ? `${highestSub.name} (${currency} ${highestSubMonthly.toFixed(
                2
              )} / ${t("monthly")})`
              : t("none")
          }
          Icon={ArrowTrendingUpIcon}
        />

        <InsightsCard
          title={t("dashboard_common_frequency")}
          value={t(`frequency_${mostCommonFreq}`)}
          Icon={ArrowPathIcon}
        />
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
                    <td>{currency} {totalPaid.toFixed(2)}</td> {/* ✅ show currency */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <SettingButton
            variant="primary"
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
          >
            {t("export_csv")}
          </SettingButton>
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
