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
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";
import { convert as convertUtil } from "../../utils/currency";
import AchievementsCard from "./InsightsAchievements";
import InsightsSummary from "./InsightsSummary";
import { TagIcon, ArrowTrendingUpIcon, ArrowPathIcon, StarIcon, AdjustmentsVerticalIcon, AcademicCapIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { getCurrencyFlag } from "../../utils/currencyFlags";

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


const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b border-gray-300 dark:border-gray-800/60">
    <span className="text-gray-700 dark:text-gray-300">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);


// ✨ Glossy gradient section container with light/dark mode
const Section = ({ title, children }) => {
  const { t } = useTranslation(); // ✅ Fix: bring t into this scope
  const TABS = [
    t("tabs.general"),
    t("tabs.categories"),
    t("tabs.frequency"),
    t("tabs.payment_methods"),
    t("tabs.trends"),
    t("tabs.forecast"),
  ];
  return (
    <div className="rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-[#0e1420] dark:to-[#1a1f2a]
  border border-gray-300 dark:border-gray-800/70 shadow-md dark:shadow-inner dark:shadow-[#141824]
  transition-all duration-300 hover:shadow-[#ed7014]/20 hover:border-[#ed7014]/60 p-4 mb-4">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700/60 pb-2 mb-3">
          {t("section_overview")}
        </h3>
      )}
      {children}
    </div>
  );
};

function PieCenterLabel({ viewBox, title, value }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs">
        {title}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 dark:fill-gray-100 text-base font-semibold">
        {value}
      </text>
    </>
  );
}

// === Animated Number Counter ===
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2, duration = 1 }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => latest.toFixed(decimals));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest.toFixed(decimals)),
    });
    return controls.stop;
  }, [value]);

  return (
    <motion.span className="tabular-nums font-bold text-gray-900 dark:text-gray-100">
      {prefix}{display}{suffix}
    </motion.span>
  );
}

export default function BudgetOverviewChart({ subscriptions, rates }) {
  const [activeTab, setActiveTab] = useState("General");
  const [activeRange, setActiveRange] = useState("6M");
  const { currency } = useCurrency();
  const { t } = useTranslation();

  const convert = convertUtil;

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthly_budget");
    return v ? Number(v) : null;
  });

  // === MAIN DATA ===
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
      if (!datePaid) {
        dueThisMonth += normalizedMonthly;
        dueThisYear += normalizedMonthly * 12;
      }

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

    const lastMonth = trends.at(-2)?.total ?? 0;
    const thisMonth = trends.at(-1)?.total ?? 0;
    const growthRate = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const isIncrease = growthRate > 0;
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
      isIncrease,
      trends, growthRate, forecast
    };
  }, [subscriptions, currency, rates, convert]);

  // === Spending Over Time ===
  const spendingData = useMemo(() => {
    if (!subscriptions?.length) return [];

    const rangeMap = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 };
    const limit = rangeMap[activeRange] ?? 6;

    const now = new Date();
    const months = Array.from({ length: limit }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (limit - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("default", { month: "short" }), total: 0 };
    });

    subscriptions.forEach((sub) => {
      const { frequency = "monthly", price = 0, payments = [], datePaid } = sub;

      if (payments?.length) {
        payments.forEach((p) => {
          const date = new Date(p.date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          const match = months.find((m) => m.key === key);
          if (match) match.total += p.amount;
        });
      } else if (datePaid) {
        const date = new Date(datePaid);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const match = months.find((m) => m.key === key);
        if (match) match.total += price;
      } else {
        months.forEach((m) => (m.total += price * (MONTHLY_FACTOR[frequency] || 1)));
      }
    });

    const totals = months.map((m) => m.total);
    const last = totals.at(-1) || 0;
    const prev = totals.at(-2) || last;
    const growthRate = prev ? (last - prev) / prev : 0;
    const forecast = Math.max(last * (1 + growthRate), 0);

    return [...months.map((m) => ({ month: m.label, value: m.total })), { month: "Next (Forecast)", value: forecast }];
  }, [subscriptions, activeRange]);

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
      case "Forecast": return [...data.trends, { label: "Next (Predicted)", total: spendingData.at(-1)?.value ?? data.forecast }];
      default: return [];
    }
  }, [activeTab, data]);

  const total = data.totalThisMonth || 0;
  const topCategory = Object.entries(data.categories || {}).sort((a, b) => b[1] - a[1])[0];
  const avgPerSub = subscriptions.length ? (total / subscriptions.length).toFixed(2) : "0.00";
  const percentUsed = budget ? ((total / budget) * 100).toFixed(1) : "0.0"; // ✅

  const cardContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
  const cardItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  useEffect(() => {
    const sync = () => {
      const v = localStorage.getItem("monthly_budget");
      setBudget(v ? Number(v) : null);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);


  return (
    <div className="space-y-4">
      {/* Overview */}
      <Section title={t("overview")}>
        <motion.div variants={cardContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            // === Summary metrics ===
            {
              label: t("monthly_spend"),
              value: (
                <span className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
                  <span className="text-xl">{getCurrencyFlag(currency)}</span>
                  {`${currency} ${(data.totalThisMonth ?? 0).toFixed(2)}`}
                </span>
              ),
              icon: <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />,
            },
            {
              label: t("annual_cost"),
              value: (
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {`${currency} ${(data.totalThisYear ?? 0).toFixed(2)}`}
                </span>
              ),
              icon: <ArrowPathIcon className="w-5 h-5 text-pink-600" />,
            },
            {
              label: t("active_subscriptions"),
              value: (
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {subscriptions?.length ?? 0}
                </span>
              ),
              icon: <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />,
            },
            {
              label: t("avg_per_subscription"),
              value: (
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {currency} {(Number(avgPerSub) || 0).toFixed(2)}
                </span>
              ),
              icon: <TagIcon className="w-5 h-5 text-orange-600" />,
            },

            // === Existing Overview metrics ===
            {
              label: t("growth_rate"),
              icon: <ChartBarIcon className="w-5 h-5 text-blue-600" />,
              value: (() => {
                const hasTrend = data.trends?.length > 1;
                const growth = Number(data?.growthRate) || 0;
                const isIncrease = growth > 0;
                if (!hasTrend) return <span className="text-gray-500">—</span>;
                const arrow = isIncrease ? "↑" : "↓";
                const color = isIncrease ? "text-orange-400" : "text-green-400";
                return (
                  <div className="flex items-center gap-2">
                    <span className={`${color} font-bold`}>
                      {arrow} <AnimatedNumber value={Math.abs(growth)} suffix="%" decimals={1} />
                    </span>
                    <div className="h-5 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trends}>
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke={data.isIncrease ? "#ED7014" : "#22c55e"}
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
            {
              label: t("top_category"),
              icon: <StarIcon className="w-5 h-5 text-green-600" />,
              value: (
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {topCategory
                    ? `${topCategory[0]} (${currency} ${(Number(topCategory[1]) || 0).toFixed(2)})`
                    : "—"}
                </span>
              ),
            },
            {
              label: t("avg_per_sub"),
              icon: <AdjustmentsVerticalIcon className="w-5 h-5 text-pink-600" />,
              value: (
                <AnimatedNumber
                  value={Number(avgPerSub) || 0}
                  prefix={currency + " "}
                  decimals={2}
                />
              ),
            },
            {
              label: t("total_subs"),
              icon: <AcademicCapIcon className="w-5 h-5 text-purple-600" />,
              value: (
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {subscriptions?.length ?? 0}
                </span>
              ),
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardItem}
              className="flex flex-col justify-between p-3 rounded-lg 
    bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1f2a] dark:to-[#0e1420]
    border border-gray-300 dark:border-gray-800/70 hover:border-[#ed7014]/60 
    shadow-sm dark:shadow-inner dark:shadow-[#141824] transition-all duration-300 
    h-full min-h-[88px]"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </div>
              {item.value}
            </motion.div>
          ))}

        </motion.div>

        {/* Budget usage */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-700 dark:text-gray-400 mb-1">
            <span>{t("budget_usage")}</span>
            <span>{percentUsed}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-[#ED7014]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      </Section>

      {/* === Charts & Forecast === */}
      <Section title={t("spending_overview", { currency })}>
        <div className="flex flex-wrap justify-center mb-3 space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 mb-2 rounded-full text-sm font-medium transition-all duration-300 
                ${activeTab === tab
                  ? "bg-[#ED7014] text-white shadow-md shadow-[#ed7014]/30"
                  : "bg-gray-200 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-[#ed7014]/30 hover:text-white"
                }`}
            >
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
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="82%"
                  paddingAngle={2}
                >
                  <Label
                    content={
                      <PieCenterLabel
                        title={t("total_this_month")}
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
            <Stat label={t("avg_monthly_payment")} value={`${(Number(data?.avgMonthly) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("expected_yearly_cost")} value={`${(Number(data?.avgYearly) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("due_this_month")} value={`${(Number(data?.dueThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("due_this_year")} value={`${(Number(data?.dueThisYear) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("paid_this_month")} value={`${(Number(data?.paidThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("paid_this_year")} value={`${(Number(data?.paidThisYear) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("total_this_month")} value={`${(Number(data?.totalThisMonth) || 0).toFixed(2)} ${currency}`} />
            <Stat label={t("total_this_year")} value={`${(Number(data?.totalThisYear) || 0).toFixed(2)} ${currency}`} />
          </motion.div>
        )}
      </Section>

      {/* Spending Over Time */}
      <Section title={t("spending_over_time")}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-3"
        >
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("projection_for_range", { range: activeRange })}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md">
              💡 {t("spending_projection_description")}
            </p>
          </div>

          <div className="flex space-x-2 mt-3 md:mt-0">
            {["1M", "3M", "6M", "12M"].map((range) => (
              <motion.button
                key={range}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 
                ${activeRange === range
                    ? "bg-[#ED7014] text-white shadow-md shadow-[#ed7014]/40"
                    : "bg-gray-200 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-[#ed7014]/40 hover:text-white"
                  }`}
              >
                {range}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="relative w-full h-[200px] overflow-hidden">
          <motion.div
            key={`pulse-${activeRange}`}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`absolute inset-0 rounded-xl blur-2xl pointer-events-none 
            ${data.isIncrease ? "bg-[#ed7014]/10" : "bg-green-500/10"}`}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRange}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={animatedData.length ? animatedData : spendingData}>
                  <XAxis dataKey="month" stroke="#aaa" fontSize={12} tickLine={false} axisLine={{ stroke: "#333" }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    formatter={(v) => [`${currency} ${v.toFixed(2)}`, "Spending"]}
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      color: "#000",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                    wrapperStyle={{ backdropFilter: "blur(8px)" }}
                  />
                  <Bar dataKey="animatedValue" radius={[10, 10, 10, 10]} fill="url(#barGradient)" isAnimationActive={false} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ED7014" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#5a2b06" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>

      {/* Achievements + Summary */}
      <AchievementsCard data={data} />
      <InsightsSummary data={data} currency={currency} />
    </div>
  );
}
