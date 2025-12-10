// src/pages/InsightsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import Analytics from "../components/Analytics";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";

// Reusable UI components
import Card from "../components/ui/Card";

export default function InsightsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const { t } = useTranslation();
  const premium = usePremium();
  const navigate = useNavigate();

  // Redirect non-premium users
  useEffect(() => {
    if (!premium.isPremium) navigate("/dashboard");
  }, [premium, navigate]);

  // Load subs
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    setSubscriptions(saved);
  }, []);

  // Load FX
  useEffect(() => {
    fetchRates("EUR").then((r) => {
      if (r) setRates(r);
    });
  }, []);

  const preferredCurrency = premium.isPremium
    ? localStorage.getItem("selected_currency") || "EUR"
    : "EUR";

  // FREQUENCY MAP
  const freqMap = {
    weekly: { days: 7, monthlyFactor: 4.345 },
    biweekly: { days: 14, monthlyFactor: 2.1725 },
    monthly: { months: 1, monthlyFactor: 1 },
    quarterly: { months: 3, monthlyFactor: 1 / 3 },
    semiannual: { months: 6, monthlyFactor: 1 / 6 },
    nine_months: { months: 9, monthlyFactor: 1 / 9 },
    yearly: { months: 12, monthlyFactor: 1 / 12 },
    biennial: { months: 24, monthlyFactor: 1 / 24 },
    triennial: { months: 36, monthlyFactor: 1 / 36 },
  };

  const getMonthlyCost = (item) => {
    const cfg = freqMap[item.frequency] || freqMap.monthly;
    const baseCurrency = item.currency || "EUR";

    const converted =
      rates && preferredCurrency
        ? convert(item.price, baseCurrency, preferredCurrency, rates)
        : item.price;

    return converted * (cfg.monthlyFactor || 1);
  };

  const totalMonthly = subscriptions.reduce(
    (sum, item) => sum + getMonthlyCost(item),
    0
  );

  const categoryTotals = subscriptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + getMonthlyCost(item);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  const highestSub =
    subscriptions.length === 0
      ? { name: "-", price: 0, currency: preferredCurrency }
      : subscriptions.reduce((prev, curr) =>
        prev.price > curr.price ? prev : curr
      );

  const highestSubPriceConverted =
    rates && highestSub
      ? convert(
        highestSub.price,
        highestSub.currency || "EUR",
        preferredCurrency,
        rates
      )
      : highestSub.price || 0;

  const freqCount = subscriptions.reduce((acc, item) => {
    acc[item.frequency] = (acc[item.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreqKey =
    subscriptions.length === 0
      ? "-"
      : Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="max-w-4xl mx-auto mt-4 p-4 pb-24 space-y-4">
      <button
        onClick={() => navigate("/dashboard")}
        className="
          mb-4 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700
          bg-white/70 dark:bg-black/30 backdrop-blur-md
          shadow-[0_3px_12px_rgba(0,0,0,0.08)]
          hover:bg-gray-100 dark:hover:bg-gray-800 transition
        "
      >
        ← {t("button_back")}
      </button>

      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white px-1">
        {t("insights_title")}
      </h1>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            highestSub.name === "-"
              ? "-"
              : `${highestSub.name} (${preferredCurrency} ${highestSubPriceConverted.toFixed(
                2
              )})`
          }
          Icon={ArrowTrendingUpIcon}
        />
        <InsightsCard
          title={t("dashboard_common_frequency")}
          value={
            mostCommonFreqKey === "-"
              ? "-"
              : t(`frequency_${mostCommonFreqKey}`)
          }
          Icon={ArrowPathIcon}
        />
      </div>

      <Analytics subscriptions={subscriptions} />
    </div>
  );
}

function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </Card>
  );
}
