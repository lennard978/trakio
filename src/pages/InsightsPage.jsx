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
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import BudgetOverviewChart from "../components/insights/BudgetOverviewChart";
import { fetchRates, convert } from "../utils/fx";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";

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

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const monthlyBudget = Number(
    localStorage.getItem("monthly_budget")
  );


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


  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  const preferredCurrency = useMemo(
    () =>
      premium.isPremium
        ? localStorage.getItem("selected_currency") || "EUR"
        : "EUR",
    [premium.isPremium]
  );

  /* ---------------- Monthly normalized cost ---------------- */
  const monthlyCost = (item) => {
    const cfg = FREQ[item.frequency] || FREQ.monthly;
    const base = item.currency || "EUR";

    const converted =
      rates && preferredCurrency
        ? convert(item.price, base, preferredCurrency, rates)
        : item.price;

    return converted * cfg.monthlyFactor;
  };

  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + monthlyCost(s),
    0
  );

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // normalize to start of day
    return d;
  }, []);


  const forecast30 = useMemo(() => {
    if (!rates) return null;
    return forecastSpend({
      subscriptions,
      fromDate: now,
      toDate: new Date(now.getTime() + 30 * 86400000),
      currency: preferredCurrency,
      rates,
      convert,
    });
  }, [subscriptions, rates, preferredCurrency]);

  useBudgetAlerts({
    forecast30,
    currency: preferredCurrency,
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

  /* ---------------- FIXED: Most expensive subscription ---------------- */
  const highestSub = useMemo(() => {
    if (!subscriptions.length) return null;

    return subscriptions.reduce((prev, curr) =>
      monthlyCost(curr) > monthlyCost(prev) ? curr : prev
    );
  }, [subscriptions, rates, preferredCurrency]);

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
              currency: preferredCurrency,
            })}
          </div>
        )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightsCard
          title={t("dashboard_total_monthly")}
          value={`${preferredCurrency} ${totalMonthly.toFixed(2)}`}
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
              ? `${highestSub.name} (${preferredCurrency} ${highestSubMonthly.toFixed(
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
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => {
                const payments = [
                  ...(Array.isArray(s.history) ? s.history : []),
                  ...(s.datePaid ? [s.datePaid] : []),
                ].sort((a, b) => new Date(b) - new Date(a));

                return (
                  <tr key={s.id} className="border-b text-center">
                    <td className="font-medium">{s.name}</td>
                    <td>{t(`frequency_${s.frequency}`)}</td>
                    <td>{payments.length}</td>
                    <td>
                      {payments
                        .map((d) =>
                          new Date(d).toLocaleDateString()
                        )
                        .join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-4">
          <SettingButton
            variant="primary"
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
          >
            {t("export_csv")}
          </SettingButton>
        </div>
      </Card>

      <BudgetOverviewChart
        subscriptions={subscriptions}
        currency={preferredCurrency}
        rates={rates}
        convert={convert}
      />

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
