// src/components/Analytics.jsx
import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function Analytics({ subscriptions }) {
  const { t } = useTranslation();
  const [monthsFilter, setMonthsFilter] = useState(12); // 12, 6, 3
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ---------------------------------------------------------------------------
  // 1. Guard – no data
  // ---------------------------------------------------------------------------
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
        {t("analytics_no_data")}
      </p>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Helpers
  // ---------------------------------------------------------------------------
  const formatMonthKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // e.g. 2025-01
  };

  const labelFromMonthKey = (key) => {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  };

  const getMonthlyCost = (sub) => {
    if (!sub || typeof sub.price !== "number") return 0;
    if (sub.frequency === "yearly") return sub.price / 12;
    return sub.price; // default assume monthly
  };

  // ---------------------------------------------------------------------------
  // 3. Precompute analytics from subscription history
  //    - Use actual payments from last 12 months (rolling window)
  // ---------------------------------------------------------------------------
  const {
    monthsList,
    lineDataAll,
    lineDataByCategory,
    categoryTotals,
    totalLast12Months,
    topCategory,
    highestSubscription,
    categories,
  } = useMemo(() => {
    const now = new Date();
    const monthsBack = 12;

    // Generate month keys from oldest → newest (12 months window)
    const months = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(formatMonthKey(d));
    }

    // { category: { '2025-01': amount, ... } }
    const monthlyTotalsByCategory = {};
    const categoryTotalSum = {}; // sum across 12 months per category
    let globalTotal = 0;

    subscriptions.forEach((sub) => {
      const category = sub.category || "Other";

      if (!Array.isArray(sub.history)) return; // no history -> skip

      sub.history.forEach((h) => {
        if (!h || !h.date) return;
        const d = new Date(h.date);
        if (Number.isNaN(d.getTime())) return;

        const key = formatMonthKey(d);

        // Only consider payments that fall in our 12-month list
        if (!months.includes(key)) return;

        const amount = typeof h.amount === "number" ? h.amount : Number(h.amount);
        if (!Number.isFinite(amount)) return;

        if (!monthlyTotalsByCategory[category]) {
          monthlyTotalsByCategory[category] = {};
        }
        monthlyTotalsByCategory[category][key] =
          (monthlyTotalsByCategory[category][key] || 0) + amount;

        categoryTotalSum[category] = (categoryTotalSum[category] || 0) + amount;
        globalTotal += amount;
      });
    });

    // Build line data for "All" and each category
    const lineAll = [];
    const perCategory = {}; // { category: [{ month, total }] }

    const cats = Object.keys(monthlyTotalsByCategory).sort();

    months.forEach((key) => {
      let sumAll = 0;

      cats.forEach((cat) => {
        const value = monthlyTotalsByCategory[cat][key] || 0;
        sumAll += value;

        if (!perCategory[cat]) perCategory[cat] = [];
        perCategory[cat].push({
          month: labelFromMonthKey(key),
          total: Number(value.toFixed(2)),
        });
      });

      lineAll.push({
        month: labelFromMonthKey(key),
        total: Number(sumAll.toFixed(2)),
      });
    });

    // Top category (by total in 12 months)
    let topCat = { name: "-", amount: 0 };
    Object.entries(categoryTotalSum).forEach(([cat, amount]) => {
      if (amount > topCat.amount) {
        topCat = { name: cat, amount };
      }
    });

    // Highest subscription (by monthly cost)
    let highest = {
      name: "-",
      monthlyCost: 0,
      category: "-",
    };

    subscriptions.forEach((sub) => {
      const monthly = getMonthlyCost(sub);
      if (monthly > highest.monthlyCost) {
        highest = {
          name: sub.name || "-",
          monthlyCost: monthly,
          category: sub.category || "Other",
        };
      }
    });

    return {
      monthsList: months,
      lineDataAll: lineAll,
      lineDataByCategory: perCategory,
      categoryTotals: categoryTotalSum,
      totalLast12Months: globalTotal,
      topCategory: topCat,
      highestSubscription: highest,
      categories: cats,
    };
  }, [subscriptions]);

  // ---------------------------------------------------------------------------
  // 4. Derive visible line data based on filters
  // ---------------------------------------------------------------------------
  const visibleLineData = useMemo(() => {
    if (!lineDataAll || lineDataAll.length === 0) return [];

    const source =
      categoryFilter === "all"
        ? lineDataAll
        : lineDataByCategory[categoryFilter] || [];

    const len = source.length;
    if (!len) return [];

    if (monthsFilter >= len) return source;

    return source.slice(len - monthsFilter);
  }, [lineDataAll, lineDataByCategory, categoryFilter, monthsFilter]);

  // ---------------------------------------------------------------------------
  // 5. Pie chart data (category distribution – last 12 months)
  // ---------------------------------------------------------------------------
  const CATEGORY_COLORS = {
    Fitness: "#22c55e",
    Bills: "#6366f1",
    Transport: "#f97316",
    Streaming: "#8b5cf6",
    Software: "#3b82f6",
    Productivity: "#f59e0b",
    Gaming: "#ef4444",
    Education: "#14b8a6",
    Food: "#84cc16",
    Other: "#64748b",
  };

  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: Number(amount.toFixed(2)),
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
  }));

  // ---------------------------------------------------------------------------
  // 6. Render
  // ---------------------------------------------------------------------------
  return (
    <div className="mt-8 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total last 12 months */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("analytics_total_12months") || "Total last 12 months"}
          </h2>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {totalLast12Months.toFixed(2)}
          </p>
        </div>

        {/* Top category */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("analytics_top_category") || "Top category (12 months)"}
          </h2>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {topCategory.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {topCategory.amount.toFixed(2)}
          </p>
        </div>

        {/* Highest subscription */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("analytics_highest_subscription") || "Highest subscription"}
          </h2>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {highestSubscription.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t("analytics_highest_subscription_monthly") || "Monthly cost"}:{" "}
            {highestSubscription.monthlyCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t("analytics_category") || "Category"}:{" "}
            {highestSubscription.category}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Period filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("analytics_filter_period") || "Period"}
          </span>
          <div className="inline-flex rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden text-xs">
            {[12, 6, 3].map((m) => (
              <button
                key={m}
                onClick={() => setMonthsFilter(m)}
                className={`px-3 py-1 ${monthsFilter === m
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                {m === 12 ? "12M" : m === 6 ? "6M" : "3M"}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("analytics_filter_category") || "Category"}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          >
            <option value="all">
              {t("analytics_filter_category_all") || "All"}
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart – 12-month trend */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
            {t("analytics_trend_title") || "Spending trend"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {categoryFilter === "all"
              ? t("analytics_trend_all") || "All categories"
              : `${t("analytics_trend_for") || "Category"}: ${categoryFilter}`}
          </p>
          <div style={{ width: "100%", height: 260 }}>
            {visibleLineData.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
                {t("analytics_no_trend_data") || "No data for selected period."}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleLineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.3)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="currentColor"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="currentColor"
                    tick={{ fontSize: 11 }}
                    width={45}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart – category distribution */}
        <div
          className="w-full bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4"
          style={{ minHeight: "260px" }}
        >
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
            {t("analytics_monthly_category") || "Spend by category (12M)"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {t("analytics_monthly_category_desc") ||
              "Based on actual payments in the last 12 months."}
          </p>

          {pieData.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
              {t("analytics_no_category_data") || "No category data available."}
            </p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) =>
                      `${entry.name} (${entry.value.toFixed(0)})`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
