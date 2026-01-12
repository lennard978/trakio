// src/components/insights/BudgetOverviewChart.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
  BarChart,
  Bar,
} from "recharts";
import PropTypes from "prop-types";
import {
  getCurrentMonthSpending,
  getCurrentYearSpending,
  getCurrentMonthDue,
  getCurrentYearDue,
} from "../../utils/budget";

import { motion } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";
import { convert as convertUtil } from "../../utils/currency";
import InsightsSummary from "./InsightsSummary";
import { useTranslation } from "react-i18next";
import { getNormalizedPayments } from "../../utils/payments";
import SmartForecastCard from "./SmartForecastCard";
import SubscriptionOptimizer from "./SubscriptionOptimizer";
import { getAnnualCost } from '../../utils/annualCost';
import { usePremium } from "../../hooks/usePremium";
// import { createPortal } from "react-dom";
import OverlappingSavings from "./OverlappingSavings";
import Stat from "./Stat";
import Section from "./Section";
import PieCenterLabel from "./PieCenterLabel";
// import AnimatedNumber from "./AnimatedNumber";
import BudgetUsageBar from "./BudgetUsageBar";
import InsightsTabs from "./InsightsTabs";
import OverviewStatsGrid from "./OverviewStatsGrid";
// import SpendingRangeSelector from "./SpendingRangeSelector";
import useOverlapsInsights from "./hooks/useOverlapsInsights";
import SaveNowModal from "./SaveNowModal";
import SpendingOverTimeSection from "./SpendingOverTimeSection";

const COLORS = [
  "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#10B981", "#F43F5E"
];

export default function BudgetOverviewChart({ subscriptions, rates }) {
  const [activeTab, setActiveTab] = useState("General");
  const [activeRange, setActiveRange] = useState("6M");
  const [saveNowOpen, setSaveNowOpen] = useState(false);
  const [saveNowMessage, setSaveNowMessage] = useState("");
  const [saveNowProvider, setSaveNowProvider] = useState(null);

  const { currency } = useCurrency();
  const { t } = useTranslation();
  const premium = usePremium();
  const hasPremiumAccess = premium.isPremium || premium.hasActiveTrial;


  const convert = convertUtil;

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthly_budget");
    return v ? Number(v) : null;
  });

  const {
    overlaps,
    overlapsLoading,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsChartData,
    overlapCurrency,
  } = useOverlapsInsights({ subscriptions });

  const annualCost = useMemo(() => {
    return getAnnualCost(subscriptions, currency, rates, convert);
  }, [subscriptions, currency, rates]);

  const TABS = useMemo(() => [
    { key: "General", label: t("tabs.general") },
    { key: "Categories", label: t("tabs.categories") },
    { key: "Frequency", label: t("tabs.frequency") },
    { key: "Payment Methods", label: t("tabs.payment_methods") },
    { key: "Trends", label: t("tabs.trends") },
    { key: "Forecast", label: t("tabs.forecast") },

  ], [t]);

  // === Spending Over Time ===
  const spendingData = useMemo(() => {
    if (!subscriptions?.length) return [];

    // Allow rendering even if rates not yet loaded
    const safeRates = rates && Object.keys(rates).length ? rates : { [currency]: 1 };

    const rangeMap = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 };
    const limit = rangeMap[activeRange] ?? 6;

    const now = new Date();
    const months = Array.from({ length: limit }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (limit - 1 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("default", { month: "short" }),
        total: 0,
      };
    });

    subscriptions.forEach((sub) => {
      const normalizedPayments = getNormalizedPayments(sub);
      normalizedPayments.forEach((p) => {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const match = months.find((m) => m.key === key);
        if (match) {
          const converted = convert(p.amount, p.currency, currency, safeRates);
          match.total += converted;
        }
      });
    });

    // Optional: Forecast
    const totals = months.map((m) => m.total);
    const last = totals.at(-1) || 0;
    const prev = totals.at(-2) || last;
    const growthRate = prev > 0 ? (last - prev) / prev : 0;
    const forecast = Math.max(last * (1 + growthRate), 0);

    return [
      ...months.map((m) => ({ month: m.label, value: m.total })),
      { month: t("forecast.next_forecast"), value: forecast }
    ];
  }, [subscriptions, activeRange, currency, rates]); // ✅ <-- safeRates REMOVED




  // const trends = spendingData.map(d => ({ label: d.month, total: d.value }));
  // const prev = trends[trends.length - 2]?.total ?? 0;
  // const curr = trends[trends.length - 1]?.total ?? 0;
  // const growthRate = prev > 0 ? ((curr - prev) / prev) * 100 : 0;


  const frequencies = {};
  const methods = {};

  subscriptions.forEach((sub) => {
    const { frequency = "unknown", method = "unknown", price = 0, currency: subCurrency } = sub;
    const amount = convert(price, subCurrency, currency, rates);

    frequencies[frequency] = (frequencies[frequency] || 0) + amount;
    methods[method] = (methods[method] || 0) + amount;
  });


  // === MAIN DATA ===
  const data = useMemo(() => {
    const paidThisMonth = getCurrentMonthSpending(subscriptions, currency, rates, convert);
    const paidThisYear = getCurrentYearSpending(subscriptions, currency, rates, convert);
    const dueThisMonth = getCurrentMonthDue(subscriptions, currency, rates, convert);
    const dueThisYear = getCurrentYearDue(subscriptions, currency, rates, convert); // Optional
    const categories = getCategoryTotals(subscriptions, currency, rates, convert);

    const frequencies = {};
    const methods = {};

    subscriptions.forEach((sub) => {
      const { frequency = "unknown", method = "unknown", price = 0, currency: subCurrency } = sub;
      const amount = convert(price, subCurrency, currency, rates);

      frequencies[frequency] = (frequencies[frequency] || 0) + amount;
      methods[method] = (methods[method] || 0) + amount;
    });

    const trends = spendingData.map(d => ({ label: d.month, total: d.value }));
    const prev = trends[trends.length - 2]?.total ?? 0;
    const curr = trends[trends.length - 1]?.total ?? 0;
    const growthRate = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    return {
      paidThisMonth,
      paidThisYear,
      dueThisMonth,
      dueThisYear,
      totalThisMonth: paidThisMonth + dueThisMonth,
      totalThisYear: paidThisYear + dueThisYear,
      avgMonthly: (paidThisYear + dueThisYear) / 12,
      avgYearly: paidThisYear + dueThisYear,
      categories, // ✅ added
      frequencies, // ✅ add this
      methods,     // ✅ add this
      trends,
      growthRate,
      isIncrease: growthRate > 0,
    };
  }, [subscriptions, currency, rates]);

  function getCategoryTotals(subs, currency, rates, convert) {
    const result = {};
    for (const sub of subs) {
      const category = sub.category || "Uncategorized";
      const amount = convert(sub.price || 0, sub.currency, currency, rates);
      result[category] = (result[category] || 0) + amount;
    }
    return result;
  }

  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    let frame = 0;
    const duration = 30;
    const start = animatedData.length ? animatedData.map(d => d.animatedValue || 0) : [];
    const end = spendingData.map(d => d.value);

    const animateFrame = () => {
      frame++;
      const progress = Math.min(frame / duration, 1);
      const interpolated = spendingData.map((d, i) => ({
        ...d,
        animatedValue: (start[i] || 0) + (end[i] - (start[i] || 0)) * progress,
      }));
      setAnimatedData(interpolated);
      if (progress < 1) requestAnimationFrame(animateFrame);
    };
    animateFrame();
  }, [spendingData]);

  const chartData = useMemo(() => {
    switch (activeTab) {
      case "General": return [
        { name: "Paid", value: data.paidThisMonth },
        { name: "Due", value: data.dueThisMonth }
      ];
      case "Categories": return Object.entries(data.categories || {}).map(([name, value]) => ({ name, value }));
      case "Frequency": return Object.entries(data.frequencies || {}).map(([name, value]) => ({ name, value }));
      case "Payment Methods": return Object.entries(data.methods || {}).map(([name, value]) => ({ name, value }));
      case "Forecast": return [...data.trends, { label: t("forecast.next_predicted"), total: spendingData.at(-1)?.value ?? data.forecast }];
      default: return [];
    }
  }, [activeTab, data]);

  const total = data.totalThisMonth || 0;
  const topCategory = Object.entries(data.categories || {}).sort((a, b) => b[1] - a[1])[0];
  const avgPerSub = subscriptions.length ? (total / subscriptions.length).toFixed(2) : "0.00";
  const percentUsed = budget ? ((total / budget) * 100).toFixed(1) : "0.0"; // ✅

  useEffect(() => {
    const sync = () => {
      const v = localStorage.getItem("monthly_budget");
      setBudget(v ? Number(v) : null);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <div className="space-y-2">
      {/* Overview */}
      <Section title={t("sections.overview")}>
        <OverviewStatsGrid
          currency={currency}
          data={data}
          annualCost={annualCost}
          avgPerSub={avgPerSub}
          subscriptionsCount={subscriptions.length}
          topCategory={topCategory}
        />


        {/* Budget usage */}
        <BudgetUsageBar
          label={t("budget.usage")}
          percentUsed={percentUsed}
        />
      </Section>

      {/* === Charts & Forecast === */}
      <Section title={t("spending_overview", { currency })}>
        <InsightsTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />


        <div className="w-full min-h-[260px]">
          <ResponsiveContainer width="100%" aspect={1.6}>
            {activeTab === "Forecast" ? (
              <LineChart data={chartData}>
                <XAxis dataKey="label" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip formatter={(v) => [`${currency} ${v.toFixed(2)}`, t("common.spending")]} />
                <Line type="monotone" dataKey="total" stroke="#ED7014" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeDasharray="5 5" />
              </LineChart>
            ) : activeTab === "Trends" ? (
              <LineChart data={data.trends}>
                <XAxis dataKey="label" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip formatter={(v) => `${currency} ${v.toFixed(2)}`} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={data.isIncrease ? "#ED7014" : "#22c55e"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  key={activeTab} // 🔁 This is the key trick to remount and animate
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="82%"
                  paddingAngle={2}
                  isAnimationActive={true} // 👈 Make sure this is set
                  animationDuration={1400} // Optional: control speed
                  animationEasing="ease-out"
                >
                  <Label
                    content={
                      <PieCenterLabel
                        title={t("stats.total_this_month")}
                        value={`${currency} ${(data.totalThisMonth ?? 0).toFixed(2)}`}
                      />
                    }
                  />
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${currency} ${v.toFixed(2)}`} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {activeTab === "General" && (
          <motion.div
            className="space-y-1 mt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Stat label={t("stats.avg_monthly_payment")} value={`${(Number(data?.avgMonthly) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.expected_yearly_cost")} value={`${(Number(data?.avgYearly) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.due_this_month")} value={`${(Number(data?.dueThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.due_this_year")} value={`${(Number(data?.dueThisYear) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.paid_this_month")} value={`${(Number(data?.paidThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.paid_this_year")} value={`${(Number(data?.paidThisYear) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.total_this_month")} value={`${(Number(data?.totalThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("stats.total_this_year")} value={`${(Number(data?.totalThisYear) || 0).toFixed(2)} ${currency}`} />
          </motion.div>
        )}
      </Section>

      {/* Spending Over Time */}
      <SpendingOverTimeSection
        title={t("spending_over_time")}
        description={t("spending_projection.description")}
        currency={currency}
        activeRange={activeRange}
        onRangeChange={setActiveRange}
        spendingData={spendingData}
        animatedData={animatedData}
        isIncrease={data.isIncrease}
        t={t}
      />


      {/* Achievements + Summary */}
      {/* 3️⃣ Behavioral & motivational feedback */}

      <SmartForecastCard data={data} currency={currency} />  {/* ← NEW */}
      {/* === Overlapping Services & Savings === */}
      <Section title={t("overlaps.title", "Overlapping Services & Savings")}>
        {/* === Total Savings Summary === */}
        {hasPremiumAccess && (totalAnnualSavings > 0 || totalMonthlySavings > 0) && (
          <div className="mb-4 rounded-lg border border-orange-500/40 
                  bg-orange-50 dark:bg-[#0e1420]
                  p-2 text-center space-y-1">

            <div className="text-sm text-green-700 dark:text-green-400">
              {t("overlaps.total_savings", "Your potential savings")}
            </div>

            <div className="text-lg font-semibold text-orange-800 dark:text-orange-300">
              {totalMonthlySavings.toFixed(2)} {overlapCurrency} / month
            </div>

            <div className="text-sm text-green-700 dark:text-green-400">
              {totalAnnualSavings.toFixed(2)} {overlapCurrency} / year
            </div>
            {hasPremiumAccess && savingsChartData.length > 0 && (
              <div className="mb-6 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(v) => `${v.toFixed(2)} ${overlapCurrency} / month`}
                    />
                    <Bar dataKey="value" fill="#ffa500" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        )}
        {/* Loading state */}
        {overlapsLoading && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("overlaps.loading", "Analyzing overlapping subscriptions…")}
          </p>
        )}

        {/* No overlaps */}
        {!overlapsLoading && overlaps.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("overlaps.none", "No overlapping services detected.")}
          </p>
        )}

        {/* Overlaps content (blurred if not premium) */}
        {!overlapsLoading && overlaps.length > 0 && (
          <div className="relative">

            {/* BLUR LAYER */}
            <div className={!hasPremiumAccess ? "blur-sm select-none pointer-events-none" : ""}>
              <div className="space-y-3">
                <OverlappingSavings
                  overlaps={overlaps}
                  subscriptions={subscriptions}   // ✅ ADD THIS
                  hasPremiumAccess={hasPremiumAccess}
                  onSaveNow={({ provider, message }) => {
                    setSaveNowProvider(provider);
                    setSaveNowMessage(message);
                    setSaveNowOpen(true);
                  }}
                />
              </div>
            </div>

            {/* PREMIUM OVERLAY */}
            {!hasPremiumAccess && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-[#0e1420]/90 
                          border border-gray-300 dark:border-gray-800 
                          rounded-xl p-4 text-center shadow-lg max-w-xs">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {t("premium.unlock_title", "Unlock subscription savings")}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t(
                      "premium.unlock_desc",
                      "See overlapping services and how much you could save every month."
                    )}
                  </p>
                  <button
                    onClick={() => window.location.href = "/premium"}
                    className="px-4 py-1.5 rounded-full bg-[#ED7014] 
                         text-white text-sm font-medium hover:opacity-90"
                  >
                    {t("premium.unlock_cta", "Upgrade to Premium")}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </Section>


      <SubscriptionOptimizer subscriptions={subscriptions} currency={currency} rates={rates} />
      <InsightsSummary data={data} currency={currency} />

      {/* Save Now Modal */}
      <SaveNowModal
        open={saveNowOpen}
        onClose={() => {
          setSaveNowOpen(false);
          setSaveNowProvider(null);
        }}
        provider={saveNowProvider}
        message={saveNowMessage}
        t={t}
      />

    </div>
  );
}
BudgetOverviewChart.propTypes = {
  // List of subscriptions (typically fetched from an API or context)
  subscriptions: PropTypes.array.isRequired,

  // Exchange rates (used for currency conversion)
  rates: PropTypes.object.isRequired,
};

