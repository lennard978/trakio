
// BudgetOverviewChart.jsx (updated with tooltip showing original + converted)

import React, { useMemo, useState } from "react";
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
} from "recharts";

const COLORS = [
  "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#10B981", "#F43F5E"
];

const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700">
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const TABS = ["General", "Categories", "Frequency", "Payment Methods", "Trends"];

const MONTHLY_FACTOR = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  nine_months: 1 / 9,
  yearly: 1 / 12,
  biennial: 1 / 24,
  triennial: 1 / 36,
};

const exportToCSV = (rows, filename = "subscriptions.csv") => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]).join(",");
  const csv = [
    headers,
    ...rows.map(row => Object.values(row).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function BudgetOverviewChart({ subscriptions, currency, rates, convert }) {
  const [activeTab, setActiveTab] = useState("General");

  const data = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let paidThisMonth = 0, paidThisYear = 0;
    let dueThisMonth = 0, dueThisYear = 0;
    let totalMonthly = 0;

    const categoryMap = {};
    const freqMap = {};
    const methodMap = {};
    const trends = [];

    for (const sub of subscriptions) {
      const {
        price = 0,
        datePaid,
        frequency = "monthly",
        category = "Uncategorized",
        method = "Unknown",
        currency: subCurrency = "EUR"
      } = sub;

      const factor = MONTHLY_FACTOR[frequency] || 1;
      const convertedPrice = convert && rates
        ? convert(price, subCurrency, currency, rates)
        : price;

      const normalizedMonthly = convertedPrice * factor;
      totalMonthly += normalizedMonthly;

      const paidDate = new Date(datePaid);
      const isPaidThisMonth = paidDate.getMonth() === month && paidDate.getFullYear() === year;
      const isPaidThisYear = paidDate.getFullYear() === year;

      if (isPaidThisMonth) paidThisMonth += convertedPrice;
      if (isPaidThisYear) paidThisYear += convertedPrice;

      const isDue = !datePaid || isNaN(paidDate.getTime());
      if (isDue) {
        dueThisMonth += normalizedMonthly;
        dueThisYear += normalizedMonthly * 12;
      }

      categoryMap[category] = (categoryMap[category] || 0) + normalizedMonthly;
      freqMap[frequency] = (freqMap[frequency] || 0) + normalizedMonthly;
      methodMap[method] = (methodMap[method] || 0) + convertedPrice;

      if (!isNaN(paidDate.getTime())) {
        const label = paidDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        const existing = trends.find(t => t.label === label);
        if (existing) {
          existing.total += convertedPrice;
        } else {
          trends.push({ label, total: convertedPrice });
        }
      }
    }

    trends.sort((a, b) => new Date("1 " + a.label) - new Date("1 " + b.label));

    return {
      paidThisMonth,
      paidThisYear,
      dueThisMonth,
      dueThisYear,
      avgMonthly: totalMonthly,
      avgYearly: totalMonthly * 12,
      totalThisMonth: paidThisMonth + dueThisMonth,
      totalThisYear: paidThisYear + dueThisYear,
      categories: categoryMap,
      frequencies: freqMap,
      methods: methodMap,
      trends
    };
  }, [subscriptions, currency, rates, convert]);

  const getChartData = () => {
    switch (activeTab) {
      case "General":
        return [
          { name: "Paid", value: data.paidThisMonth },
          { name: "Due", value: data.dueThisMonth }
        ];
      case "Categories":
        return Object.entries(data.categories).map(([name, value]) => ({ name, value }));
      case "Frequency":
        return Object.entries(data.frequencies).map(([name, value]) => ({ name, value }));
      case "Payment Methods":
        return Object.entries(data.methods).map(([name, value]) => ({ name, value }));
      default:
        return [];
    }
  };

  const chartData = getChartData();

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-center w-full">
          Spending Overview ({currency})
        </h3>
        <button
          onClick={() => exportToCSV(subscriptions)}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
        >
          Export CSV
        </button>
      </div>

      <div className="flex justify-center mb-4 space-x-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 mb-2 rounded-full text-sm font-medium ${activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "Trends" ? (
            <LineChart data={data.trends}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v) => `${currency} ${v.toFixed(2)}`} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4 }}
                animationDuration={500}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={90}
                label={({ name, value }) =>
                  value > 0 ? `${name} (${currency} ${value.toFixed(2)})` : ""
                }
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => {
                  const sub = subscriptions.find(
                    (s) =>
                      s.category === name ||
                      s.frequency === name ||
                      s.method === name ||
                      name === "Paid" || name === "Due"
                  );
                  const original = sub?.price || val;
                  const originalCurrency = sub?.currency || currency;
                  const formatted = `${currency} ${val.toFixed(2)}`;
                  const originalText =
                    convert && rates && sub
                      ? ` (original: ${originalCurrency} ${original.toFixed(2)})`
                      : "";
                  return formatted + originalText;
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {activeTab === "General" && (
        <div className="space-y-1">
          <Stat label="Average monthly payment" value={`${data.avgMonthly.toFixed(2)} ${currency}`} />
          <Stat label="Average yearly payment" value={`${data.avgYearly.toFixed(2)} ${currency}`} />
          <Stat label="Due payments this month" value={`${data.dueThisMonth.toFixed(2)} ${currency}`} />
          <Stat label="Due payments this year" value={`${data.dueThisYear.toFixed(2)} ${currency}`} />
          <Stat label="Paid this month" value={`${data.paidThisMonth.toFixed(2)} ${currency}`} />
          <Stat label="Paid this year" value={`${data.paidThisYear.toFixed(2)} ${currency}`} />
          <Stat label="Total this month" value={`${data.totalThisMonth.toFixed(2)} ${currency}`} />
          <Stat label="Total this year" value={`${data.totalThisYear.toFixed(2)} ${currency}`} />
        </div>
      )}
    </div>
  );
}
