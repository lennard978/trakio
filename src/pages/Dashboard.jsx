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
  const [subscriptions, setSubscriptions] = useState([]);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("selected_currency") || "EUR"
  );
  const [rates, setRates] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const premium = usePremium();
  const { t } = useTranslation();

  const urlHasInsights = location.search.includes("insights=1");
  const [isInsightsActive, setIsInsightsActive] = useState(urlHasInsights);

  const insightsRef = useRef(null);

  const hasSubscriptions = subscriptions.length > 0;

  useEffect(() => {
    const saved = localStorage.getItem("subscriptions");
    if (saved) setSubscriptions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

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

  const highestSubConverted =
    rates && highestSub
      ? convert(highestSub.price, highestSub.currency || "EUR", preferredCurrency, rates)
      : highestSub.price;

  const freqCount = subscriptions.reduce((acc, item) => {
    acc[item.frequency] = (acc[item.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreq =
    subscriptions.length === 0
      ? "-"
      : Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0][0];

  const handleCurrencyChange = (val) => {
    if (!premium.isPremium) {
      navigate("/premium?reason=currency");
      return;
    }
    setCurrency(val);
    localStorage.setItem("selected_currency", val);
  };

  const handleToggleInsights = () => {
    const next = !isInsightsActive;
    setIsInsightsActive(next);

    const search = next ? "?insights=1" : "";
    navigate(`/dashboard${search}`, { replace: true });

    if (next && insightsRef.current) {
      setTimeout(() => {
        insightsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  const canShowInsights = premium.isPremium && hasSubscriptions;

  return (
    <div className="pb-4">
      <TrialBanner />

      {hasSubscriptions && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">{t("dashboard_title")}</h1>

          <div className="flex items-center gap-2">
            {premium.isPremium ? (
              <CurrencySelector value={preferredCurrency} onChange={handleCurrencyChange} />
            ) : (
              <button
                onClick={() => navigate("/premium?reason=currency")}
                className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                EUR · {t("premium_locked_currency")}
              </button>
            )}

            {canShowInsights && (
              <button
                onClick={handleToggleInsights}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isInsightsActive ? t("button_hide_insights") : t("button_show_insights")}
              </button>
            )}
          </div>
        </div>
      )}

      {!hasSubscriptions && (
        <div className="text-center text-gray-500 mt-10">
          <p className="mb-3">{t("dashboard_empty")}</p>
          <Link to="/add" className="text-blue-600 hover:underline">
            {t("dashboard_empty_cta")}
          </Link>
        </div>
      )}

      {hasSubscriptions && canShowInsights ? (
        <div className="relative mt-2 overflow-hidden rounded-lg" ref={insightsRef}>
          <div
            className={`flex w-[200%] transition-transform duration-300 ${isInsightsActive ? "-translate-x-1/2" : "translate-x-0"
              }`}
          >
            <div className="w-1/2 pr-2 space-y-3">
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

            <div className="w-1/2 pl-2 space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <InsightsCard
                  title={t("dashboard_total_monthly")}
                  value={`${preferredCurrency} ${totalMonthly.toFixed(2)}`}
                  Icon={CurrencyEuroIcon}
                />

                <InsightsCard title={t("dashboard_top_category")} value={topCategory} Icon={TagIcon} />

                <InsightsCard
                  title={t("dashboard_highest_sub")}
                  value={
                    highestSub.name === "-"
                      ? "-"
                      : `${highestSub.name} (${preferredCurrency} ${highestSubConverted.toFixed(2)})`
                  }
                  Icon={ArrowTrendingUpIcon}
                />

                <InsightsCard
                  title={t("dashboard_common_frequency")}
                  value={mostCommonFreq === "-" ? "-" : t(`frequency_${mostCommonFreq}`)}
                  Icon={ArrowPathIcon}
                />
              </div>

              <Analytics subscriptions={subscriptions} />
            </div>
          </div>
        </div>
      ) : hasSubscriptions ? (
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
      ) : null}
    </div>
  );
}

function InsightsCard({ title, value, Icon }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{value}</div>
      </div>
    </div>
  );
}
