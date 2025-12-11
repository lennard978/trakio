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

import Analytics from "../components/Analytics";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";

import Card from "../components/ui/Card";

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

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const premium = usePremium();

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  // Block access for non-premium users
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
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  const preferredCurrency = useMemo(() => {
    return premium.isPremium
      ? localStorage.getItem("selected_currency") || "EUR"
      : "EUR";
  }, [premium.isPremium]);

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
    (sum, item) => sum + monthlyCost(item),
    0
  );

  const categoryTotals = subscriptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + monthlyCost(item);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    t("none");

  const highestSub =
    subscriptions.length === 0
      ? null
      : subscriptions.reduce((p, c) => (p.price > c.price ? p : c));

  const highestSubConverted =
    rates && highestSub
      ? convert(
        highestSub.price,
        highestSub.currency || "EUR",
        preferredCurrency,
        rates
      )
      : highestSub?.price || 0;

  const freqCount = subscriptions.reduce((acc, item) => {
    acc[item.frequency] = (acc[item.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreq =
    subscriptions.length === 0
      ? "-"
      : Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="max-w-4xl mx-auto mt-0 p-2 pb-4 space-y-4">


      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {t("insights_title")}
      </h1>

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
            highestSub
              ? `${highestSub.name} (${preferredCurrency} ${highestSubConverted.toFixed(
                2
              )})`
              : t("none")
          }
          Icon={ArrowTrendingUpIcon}
        />

        <InsightsCard
          title={t("dashboard_common_frequency")}
          value={
            mostCommonFreq === "-" ? "-" : t(`frequency_${mostCommonFreq}`)
          }
          Icon={ArrowPathIcon}
        />
      </div>

      <Analytics subscriptions={subscriptions} />
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
    </div>
  );
}

function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </Card>
  );
}
