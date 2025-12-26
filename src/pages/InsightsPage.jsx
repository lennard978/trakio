// src/pages/InsightsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forecastSpend } from "../utils/forecast";
import useBudgetAlerts from "../hooks/useBudgetAlerts";

import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";
import { useCurrency } from "../context/CurrencyContext";
import { convert } from "../utils/currency";

import Card from "../components/ui/Card";
import BudgetOverviewChart from "../components/insights/BudgetOverviewChart";
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
  const { currency } = useCurrency();

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const monthlyBudget = Number(localStorage.getItem("monthly_budget"));

  useEffect(() => {
    if (premium.loaded && !premium.isPremium) {
      navigate("/dashboard");
    }
  }, [premium.loaded, premium.isPremium, navigate]);

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
      convert: (amount, from) => convert(amount, from, currency, rates),
    });
  }, [subscriptions, rates, now, currency]);

  useBudgetAlerts({
    forecast30,
    isPremium: premium.isPremium,
  });


  return (
    <div className="max-w-4xl mx-auto p-2 pb-6 space-y-4">
      {/* Budget Warning */}
      {premium.isPremium &&
        forecast30 &&
        monthlyBudget &&
        forecast30.total > monthlyBudget && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-[#2b0b0b]/80 border border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm text-center shadow-inner dark:shadow-red-900/30">
            {t("budget_exceeded", {
              spend: forecast30.total.toFixed(2),
              budget: monthlyBudget.toFixed(2),
            })}
          </div>
        )}

      <PremiumGuard>
        <BudgetOverviewChart subscriptions={subscriptions} rates={rates} />
      </PremiumGuard>

      {/* Payment History */}
      <Card
        className="mt-6 p-5 rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-[#0e1420] dark:to-[#1a1f2a]
        border border-gray-300 dark:border-gray-800/70 shadow-md dark:shadow-inner dark:shadow-[#141824]
        hover:border-[#ed7014]/60 hover:shadow-[#ed7014]/20 transition-all duration-300"
      >
        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-800/70 pb-2">
          {t("insights_payment_history")}
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-800/70">
          <table className="w-full text-xs table-auto text-gray-700 dark:text-gray-200">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700/70 bg-gray-100 dark:bg-[#141824]/60 text-gray-600 dark:text-gray-400">
                <th className="py-2 px-3 text-left font-medium">{t("insights_payment_Subscription")}</th>
                <th className="py-2 px-3 text-left font-medium">{t("insights_payment_Frequency")}</th>
                <th className="py-2 px-3 text-center font-medium">{t("insights_payment_Payments")}</th>
                <th className="py-2 px-3 text-left font-medium">{t("insights_payment_Dates")}</th>
                <th className="py-2 px-3 text-right font-medium">{t("insights_payment_Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => {
                const payments = (() => {
                  if (Array.isArray(s.payments)) return s.payments;
                  const list = [];
                  if (Array.isArray(s.history)) {
                    s.history.forEach((d) =>
                      list.push({ date: d, amount: s.price, currency: s.currency || "EUR" })
                    );
                  }
                  if (s.datePaid) {
                    list.push({ date: s.datePaid, amount: s.price, currency: s.currency || "EUR" });
                  }
                  return list;
                })();

                const totalPaid = payments.reduce((sum, p) => {
                  const converted = rates ? convert(p.amount, p.currency, currency, rates) : p.amount;
                  return sum + converted;
                }, 0);

                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 dark:border-gray-800/70 hover:bg-orange-50 dark:hover:bg-[#ed7014]/10 transition-colors duration-200"
                  >
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{t(`frequency_${s.frequency}`)}</td>
                    <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">{payments.length}</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {payments.map((p) => new Date(p.date).toLocaleDateString()).join(", ")}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">
                      {`${currency} ${totalPaid.toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>



      <button
        onClick={() => navigate("/dashboard")}
        className="mt-4 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#141824]/70 hover:bg-orange-100 dark:hover:bg-[#ed7014]/30 hover:border-[#ed7014]/60 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
      >
        ← {t("button_back")}
      </button>
    </div>
  );
}
