// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import Analytics from "../components/Analytics";
import useNotifications from "../hooks/useNotifications";
import { useTranslation } from "react-i18next";
import CurrencySelector from "../components/CurrencySelector";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("selected_currency") || "EUR"
  );
  const [rates, setRates] = useState(null);

  // Controls which "screen" is visible (List vs Insights)
  const [isInsightsActive, setIsInsightsActive] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const insightsRef = useRef(null);

  // Load subscriptions once
  useEffect(() => {
    const saved = localStorage.getItem("subscriptions");
    if (saved) setSubscriptions(JSON.parse(saved));
  }, []);

  // Load FX rates
  useEffect(() => {
    fetchRates("EUR").then((r) => {
      if (r) setRates(r);
    });
  }, []);

  // Notifications for upcoming renewals
  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const canShowInsights = premium.isPremium && hasSubscriptions;

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

  const preferredCurrency = premium.isPremium ? currency : "EUR";

  // Monthly cost helper
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

  // Renewal sorting
  const getNextRenewalDate = (item) => {
    if (!item.datePaid) return new Date(8640000000000000);
    const paid = new Date(item.datePaid);
    const next = new Date(paid);
    const cfg = freqMap[item.frequency] || freqMap.monthly;
    if (cfg.months) next.setMonth(next.getMonth() + cfg.months);
    if (cfg.days) next.setDate(next.getDate() + cfg.days);
    return next;
  };

  const sorted = subscriptions
    .slice()
    .sort((a, b) => getNextRenewalDate(a) - getNextRenewalDate(b));

  // Insights calculations
  const categoryTotals = subscriptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + getMonthlyCost(item);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  const highestSub =
    subscriptions.length > 0
      ? subscriptions.reduce((prev, curr) =>
        prev.price > curr.price ? prev : curr
      )
      : { name: "-", price: 0, currency: preferredCurrency };

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

  // Currency change
  const handleCurrencyChange = (val) => {
    if (!premium.isPremium) {
      navigate("/premium?reason=currency");
      return;
    }
    setCurrency(val);
    localStorage.setItem("selected_currency", val);
  };

  // Toggle Insights with iOS-style horizontal slide
  const handleToggleInsights = () => {
    setIsInsightsActive((prev) => {
      const next = !prev;
      if (next && insightsRef.current) {
        insightsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return next;
    });
  };

  return (
    <div style={{ touchAction: "pan-y" }}>
      <TrialBanner />

      {/* HEADER + INSIGHTS TOGGLE + CURRENCY */}
      {hasSubscriptions && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">{t("dashboard_title")}</h1>

          <div className="flex items-center gap-2">
            {/* PREMIUM-ONLY CURRENCY SELECTOR */}
            {premium.isPremium ? (
              <CurrencySelector
                value={preferredCurrency}
                onChange={handleCurrencyChange}
              />
            ) : (
              <button
                onClick={() => navigate("/premium?reason=currency")}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
              >
                EUR · {t("premium_locked_currency")}
              </button>
            )}

            {/* INSIGHTS TOGGLE – only for premium & if there is data */}
            {canShowInsights && (
              <button
                onClick={handleToggleInsights}
                className="text-xs sm:text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {isInsightsActive
                  ? t("button_hide_insights")
                  : t("button_show_insights")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!hasSubscriptions && (
        <div className="text-center text-gray-500 mt-10">
          <p className="mb-3">{t("dashboard_empty")}</p>
          <Link to="/add" className="text-blue-600 hover:underline">
            {t("dashboard_empty_cta")}
          </Link>
        </div>
      )}

      {/* If premium + data → slide between LIST and INSIGHTS.
          Otherwise just show the LIST. */}
      {hasSubscriptions && canShowInsights ? (
        <div
          ref={insightsRef}
          className="relative mt-2 overflow-hidden rounded-lg"
        >
          {/* SLIDER CONTAINER: 2 screens (list + insights) */}
          <div
            className={`flex w-[200%] transition-transform duration-300 ease-out ${isInsightsActive ? "-translate-x-1/2" : "translate-x-0"
              }`}
          >
            {/* LEFT SCREEN: SUBSCRIPTION LIST */}
            <div className="w-1/2 pr-2">
              <div className="space-y-3">
                {sorted.map((sub) => (
                  <SubscriptionItem
                    key={sub.id}
                    item={sub}
                    currency={preferredCurrency}
                    rates={rates}
                    convert={convert}
                    onDelete={(id) => {
                      const updated = subscriptions.filter((s) => s.id !== id);
                      setSubscriptions(updated);
                      localStorage.setItem(
                        "subscriptions",
                        JSON.stringify(updated)
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT SCREEN: INSIGHTS + ANALYTICS */}
            <div className="w-1/2 pl-2">
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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

                {/* Analytics charts */}
                <Analytics subscriptions={subscriptions} />

                {/* Close insights button */}
                <div className="mt-4 flex justify-center pb-4">
                  <button
                    onClick={handleToggleInsights}
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {t("button_hide_insights")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasSubscriptions ? (
        // Non-premium OR premium without data → normal list only
        <div className="mt-2 space-y-3">
          {sorted.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              item={sub}
              currency={preferredCurrency}
              rates={rates}
              convert={convert}
              onDelete={(id) => {
                const updated = subscriptions.filter((s) => s.id !== id);
                setSubscriptions(updated);
                localStorage.setItem(
                  "subscriptions",
                  JSON.stringify(updated)
                );
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Insight card helper
function InsightsCard({ title, value, Icon }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full transition-all">
      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {value}
        </div>
      </div>
    </div>
  );
}
