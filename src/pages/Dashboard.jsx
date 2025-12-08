import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const premium = usePremium();

  const [subscriptions, setSubscriptions] = useState([]);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("selected_currency") || "EUR"
  );
  const [rates, setRates] = useState(null);

  // Two-screen layout: LIST (false) or INSIGHTS (true)
  const [isInsightsActive, setIsInsightsActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const insightsRef = useRef(null);

  /* ---------------------------------------------------------
     1. INITIAL LOAD
  --------------------------------------------------------- */

  useEffect(() => {
    const saved = localStorage.getItem("subscriptions");
    if (saved) setSubscriptions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const canShowInsights = premium.isPremium && hasSubscriptions;

  /* ---------------------------------------------------------
     2. SYNC BOTTOM TAB STATE VIA ?insights=1
  --------------------------------------------------------- */

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openInsights = params.get("insights") === "1";

    if (openInsights && premium.isPremium) {
      setIsInsightsActive(true);
    } else {
      setIsInsightsActive(false);
    }
  }, [location.search, premium.isPremium]);

  /* ---------------------------------------------------------
     3. CURRENCY HANDLING
  --------------------------------------------------------- */

  const preferredCurrency = premium.isPremium ? currency : "EUR";

  const handleCurrencyChange = (val) => {
    if (!premium.isPremium) {
      navigate("/premium?reason=currency");
      return;
    }
    setCurrency(val);
    localStorage.setItem("selected_currency", val);
  };

  /* ---------------------------------------------------------
     4. COST + RENEWAL LOGIC
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     5. INSIGHTS SUMMARY
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     6. ANIMATION HANDLING (IOS SLIDE + FADE)
  --------------------------------------------------------- */

  const sliderClass = `
  flex w-[200%]
  transition-transform duration-600
  ease-[cubic-bezier(.25,.8,.25,1)]
  will-change-transform
  ${isInsightsActive ? "-translate-x-1/2" : "translate-x-0"}
`;


  const fadeOverlayClass = `
  absolute inset-0 pointer-events-none
  bg-gradient-to-b from-transparent to-black/5
  transition-opacity duration-500
  ${isInsightsActive ? "opacity-0" : "opacity-0"}
`;


  /* ---------------------------------------------------------
     7. RENDER
  --------------------------------------------------------- */

  return (
    <div className="mt-2 mb-20 relative">
      <TrialBanner />

      {/* ------------------------------ EMPTY STATE ------------------------------ */}
      {!hasSubscriptions && (
        <div className="text-center text-gray-500 mt-10">
          <p className="mb-3">{t("dashboard_empty")}</p>
          <Link to="/add" className="text-blue-600 hover:underline">
            {t("dashboard_empty_cta")}
          </Link>
        </div>
      )}

      {/* ------------------------------ PREMIUM INSIGHTS HANDLER ------------------------------ */}
      {canShowInsights && (
        <div
          ref={insightsRef}
          className="relative mt-2 overflow-hidden rounded-lg min-h-[600px]"
        >
          {/* Main slider: 2 screens side-by-side */}
          <div className={sliderClass}>
            {/* LEFT SCREEN: LIST */}
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

            {/* RIGHT SCREEN: INSIGHTS */}
            <div className="w-1/2 pl-2">
              <div className="space-y-4">
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

                <Analytics subscriptions={subscriptions} />
              </div>
            </div>
          </div>

          {/* Fade overlay (iOS style subtle overlay) */}
          <div className={fadeOverlayClass} />
        </div>
      )}

      {/* ------------------------------ NON-PREMIUM LIST ------------------------------ */}
      {!premium.isPremium && hasSubscriptions && (
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
                localStorage.setItem("subscriptions", JSON.stringify(updated));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ INSIGHTS CARD ------------------------------ */

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
