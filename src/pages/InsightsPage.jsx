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
import PaymentAccordion from "../components/insights/PaymentAccordion";
import {
  getCurrentMonthSpending,
  getCurrentYearSpending,
  getCurrentMonthDue,
  getCurrentYearDue,
} from "../utils/budget";

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email;
  const premium = usePremium();
  const { currency } = useCurrency();

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  // ✅ Now it's safe to use them in hooks
  const actualSpent = useMemo(() => {
    return getCurrentMonthSpending(subscriptions, currency, rates, convert);
  }, [subscriptions, currency, rates, convert]);

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
        // console.error("Insights load error:", err);
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
      {/* {premium.isPremium &&
        monthlyBudget &&
        actualSpent > monthlyBudget && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-[#2b0b0b]/80 border border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm text-center shadow-inner dark:shadow-red-900/30">
            {t("budget_exceeded", {
              spend: actualSpent.toFixed(2),
              budget: monthlyBudget.toFixed(2),
            })}
          </div>
        )} */}

      <PremiumGuard>
        <BudgetOverviewChart subscriptions={subscriptions} rates={rates} />
      </PremiumGuard>
      {/* Payment History */}
      <Card
        className="mt-6 p-5 rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-[#0e1420] dark:to-[#1a1f2a]
        border border-gray-300 dark:border-gray-800/70 shadow-md dark:shadow-inner dark:shadow-[#141824]
        hover:border-[#ed7014]/60 hover:shadow-[#ed7014]/20 transition-all duration-300"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t("insights_payment_history")}
        </h2>

        <PaymentAccordion subscriptions={subscriptions} currency={currency} rates={rates} convert={convert} />
      </Card>
    </div>
  );
}
