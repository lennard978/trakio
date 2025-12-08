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

  // Controls which view is visible
  const [isInsightsActive, setIsInsightsActive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const insightsRef = useRef(null);

  // Load subscriptions
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

  // Toggle Insights with fade-out → switch → fade-in
  const handleToggleInsights = () => {

    // Fade out current content
    setIsFadingOut(true);

    setTimeout(() => {
      // Switch view
      setIsInsightsActive((prev) => {
        const next = !prev;
        // When switching INTO insights, scroll into view
        if (next && insightsRef.current) {
          insightsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        return next;
      });

      // Then fade in new content
      setIsFadingOut(false);
    }, 250); // match .blur-fade-out / .blur-fade-in timing
  };

  const showInsightsView =
    premium.isPremium && hasSubscriptions && isInsightsActive;

  return (
    <div style={{ touchAction: "pan-y" }}>
      <TrialBanner />

      {/* HEADER + INSIGHTS TOGGLE */}
      {hasSubscriptions && (
        <div className="flex justify-between items-center mb-3">
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

          </div>
          <div className="w-full flex justify-end mb-3">
            <button
              onClick={handleToggleInsights}
              className="text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {showInsightsView
                ? t("button_hide_insights")
                : t("button_show_insights")}
            </button>
          </div>

        </div>
      )}

      {/* CONTENT AREA: EITHER LIST OR INSIGHTS (CROSSFADE) */}
      <div
        ref={insightsRef}
        className={`mt-2 ${isFadingOut ? "blur-fade-out" : "blur-fade-in"}`}
      >
        {showInsightsView ? (
          // 👉 INSIGHTS VIEW (list hidden)
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
                className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("button_hide_insights")}
              </button>
            </div>
          </div>
        ) : (
          // 👉 SUBSCRIPTION LIST VIEW
          <>
            {!hasSubscriptions ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="mb-3">{t("dashboard_empty")}</p>
                <Link to="/add" className="text-blue-600 hover:underline">
                  {t("dashboard_empty_cta")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((sub) => (
                  <SubscriptionItem
                    key={sub.id}
                    item={sub}
                    currency={preferredCurrency}
                    rates={rates}
                    convert={convert}
                    onDelete={(id) => {
                      const updated = subscriptions.filter(
                        (s) => s.id !== id
                      );
                      setSubscriptions(updated);
                      localStorage.setItem(
                        "subscriptions",
                        JSON.stringify(updated)
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
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
