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
} from "recharts";
import { motion } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";
import { convert as convertUtil } from "../../utils/currency";
import AchievementsCard from "./InsightsAchievements";
import InsightsSummary from "./InsightsSummary";

const COLORS = [
  "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#10B981", "#F43F5E"
];

const MONTHLY_FACTOR = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  yearly: 1 / 12,
  biennial: 1 / 24,
  triennial: 1 / 36,
};

const TABS = ["General", "Categories", "Frequency", "Payment Methods", "Trends", "Forecast"];

const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b border-gray-800/70">
    <span className="text-gray-300">{label}</span>
    <span className="font-medium text-gray-100">{value}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="rounded-xl bg-[#0e1420] border border-gray-800/60 shadow-sm p-4 mb-4">
    {title && (
      <h3 className="text-sm font-semibold text-gray-100 border-b border-gray-700/60 pb-2 mb-3">
        {title}
      </h3>
    )}
    {children}
  </div>
);

function PieCenterLabel({ viewBox, title, value }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-xs">
        {title}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" className="fill-gray-100 text-base font-semibold">
        {value}
      </text>
    </>
  );
}

export default function BudgetOverviewChart({ subscriptions, rates }) {
  const [activeTab, setActiveTab] = useState("General");
  const { currency } = useCurrency();
  const convert = convertUtil;

  // === Calculations ===
  const data = useMemo(() => {
    if (!subscriptions?.length) return {};
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let paidThisMonth = 0, paidThisYear = 0, dueThisMonth = 0, dueThisYear = 0;
    const categoryMap = {}, freqMap = {}, methodMap = {}, trends = [];

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
      const convertedPrice = convert ? convert(price, subCurrency, currency, rates) : price;
      const normalizedMonthly = convertedPrice * factor;

      const paidDate = new Date(datePaid);
      const isPaidThisMonth = paidDate.getMonth() === month && paidDate.getFullYear() === year;
      const isPaidThisYear = paidDate.getFullYear() === year;

      if (isPaidThisMonth) paidThisMonth += convertedPrice;
      if (isPaidThisYear) paidThisYear += convertedPrice;
      if (!datePaid) { dueThisMonth += normalizedMonthly; dueThisYear += normalizedMonthly * 12; }

      categoryMap[category] = (categoryMap[category] || 0) + normalizedMonthly;
      freqMap[frequency] = (freqMap[frequency] || 0) + normalizedMonthly;
      methodMap[method] = (methodMap[method] || 0) + convertedPrice;

      if (!isNaN(paidDate.getTime())) {
        const label = paidDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        const existing = trends.find(t => t.label === label);
        existing ? (existing.total += convertedPrice) : trends.push({ label, total: convertedPrice });
      }
    }

    trends.sort((a, b) => new Date("1 " + a.label) - new Date("1 " + b.label));

    // Growth + Forecast
    const lastMonth = trends.at(-2)?.total ?? 0;
    const thisMonth = trends.at(-1)?.total ?? 0;
    const growthRate = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const forecast = thisMonth * 1.08;

    return {
      paidThisMonth, paidThisYear, dueThisMonth, dueThisYear,
      avgYearly: paidThisYear + dueThisYear,
      avgMonthly: (paidThisYear + dueThisYear) / 12,
      totalThisMonth: paidThisMonth + dueThisMonth,
      totalThisYear: paidThisYear + dueThisYear,
      categories: categoryMap,
      frequencies: freqMap,
      methods: methodMap,
      trends, growthRate, forecast
    };
  }, [subscriptions, currency, rates, convert]);

  // Chart data
  const chartData = useMemo(() => {
    switch (activeTab) {
      case "General": return [
        { name: "Paid", value: data.paidThisMonth },
        { name: "Due", value: data.dueThisMonth }
      ];
      case "Categories": return Object.entries(data.categories || {}).map(([name, value]) => ({ name, value }));
      case "Frequency": return Object.entries(data.frequencies || {}).map(([name, value]) => ({ name, value }));
      case "Payment Methods": return Object.entries(data.methods || {}).map(([name, value]) => ({ name, value }));
      case "Forecast": return [
        ...data.trends,
        { label: "Next (Predicted)", total: data.forecast }
      ];
      default: return [];
    }
  }, [activeTab, data]);

  const total = data.totalThisMonth || 0;
  const topCategory = Object.entries(data.categories || {}).sort((a, b) => b[1] - a[1])[0];
  const avgPerSub = subscriptions.length ? (total / subscriptions.length).toFixed(2) : "0.00";
  const percentUsed = ((total / 500) * 100).toFixed(1);

  // Upcoming
  const upcoming = subscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    nextDue: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  }));

  // Heatmap dummy
  const heatmapValues = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2025, i).toLocaleString("default", { month: "short" }),
    intensity: Math.random(),
  }));

  const cardContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const cardItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="space-y-4">
      {/* === Overview === */}
      <Section title="Overview">
        <motion.div
          variants={cardContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
        >
          {[
            // === Growth Rate ===
            {
              label: "Growth Rate",
              value: (() => {
                const hasTrend = data.trends?.length > 1;
                const growth = Number(data?.growthRate) || 0;
                const isIncrease = growth > 0;

                if (!hasTrend) {
                  return <span className="text-gray-500">—</span>;
                }

                const arrow = isIncrease ? "↑" : "↓";
                const color = isIncrease ? "text-red-400" : "text-green-400";

                return (
                  <div className="flex items-center gap-2">
                    <span className={`${color} font-bold`}>
                      {arrow} {Math.abs(growth).toFixed(1)}%
                    </span>

                    {/* mini sparkline */}
                    <div className="h-5 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trends}>
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke={isIncrease ? "#ef4444" : "#22c55e"}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={600}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })(),
            },


            // === Top Category ===
            {
              label: "Top Category",
              value: (
                <span className="font-bold text-gray-100">
                  {topCategory
                    ? `${topCategory[0]} (${currency} ${(Number(topCategory[1]) || 0).toFixed(2)})`
                    : "—"}
                </span>
              ),
            },

            // === Avg per Subscription ===
            {
              label: "Avg / Subscription",
              value: (
                <span className="font-bold text-gray-100">
                  {currency} {(Number(avgPerSub) || 0).toFixed(2)}
                </span>
              ),
            },

            // === Total Subs ===
            {
              label: "Total Subs",
              value: (
                <span className="font-bold text-gray-100">
                  {subscriptions?.length ?? 0}
                </span>
              ),
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardItem}
              className="flex flex-col justify-between p-3 rounded-lg bg-gray-800/60 h-full min-h-[88px]"
            >
              <div className="text-gray-400">{item.label}</div>
              {item.value}
            </motion.div>
          ))}
        </motion.div>


        {/* Budget usage */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Budget usage</span>
            <span>{percentUsed}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      </Section>

      {/* === Charts & Forecast === */}
      <Section title={`Spending Overview (${currency})`}>
        <div className="flex flex-wrap justify-center mb-3 space-x-2">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 mb-2 rounded-full text-sm font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-700/70 text-gray-300 hover:bg-gray-600/80"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="w-full min-h-[260px]">
          <ResponsiveContainer width="100%" aspect={1.6}>
            {activeTab === "Forecast" ? (
              <LineChart data={chartData}>
                <XAxis dataKey="label" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip formatter={(v) => `${currency} ${v.toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
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
                  stroke={isIncrease ? "#ef4444" : "#22c55e"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="82%" paddingAngle={2}>
                  <Label content={<PieCenterLabel title="Total this month" value={`${currency} ${(data.totalThisMonth ?? 0).toFixed(2)}`} />} />
                  {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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
            <Stat
              label="Average monthly payment"
              value={`${(Number(data?.avgMonthly) || 0).toFixed(2)} ${currency}`}
            />

            <Stat
              label="Expected yearly cost (this year)"
              value={`${(Number(data?.avgYearly) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Due payments this month"
              value={`${(Number(data?.dueThisMonth) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Due payments this year"
              value={`${(Number(data?.dueThisYear) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Paid this month"
              value={`${(Number(data?.paidThisMonth) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Paid this year"
              value={`${(Number(data?.paidThisYear) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Total this month"
              value={`${(Number(data?.totalThisMonth) || 0).toFixed(2)} ${currency}`}
            />
            <Stat
              label="Total this year"
              value={`${(Number(data?.totalThisYear) || 0).toFixed(2)} ${currency}`}
            />
          </motion.div>
        )}

      </Section>

      {/* === Achievements === */}
      <AchievementsCard data={data} />

      {/* === AI-Style Summary === */}
      <InsightsSummary data={data} currency={currency} />

      {/* === Heatmap === */}
      <Section title="Spending Heatmap">
        <div className="grid grid-cols-12 gap-1">
          {heatmapValues.map((h) => (
            <div key={h.label} title={h.label} className={`h-4 w-4 rounded ${h.intensity > 0.8 ? "bg-blue-600" : h.intensity > 0.4 ? "bg-blue-400" : "bg-blue-200"}`} />
          ))}
        </div>
      </Section>
    </div>
  );
}
