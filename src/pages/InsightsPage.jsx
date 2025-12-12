import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import PaymentTimelineChart from "../components/PaymentTimelineChart";

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

function normalizeHistory(sub) {
  const raw = Array.isArray(sub.history) ? sub.history : [];
  return raw
    .map((h) => {
      if (typeof h === "string") {
        const d = new Date(h);
        if (Number.isNaN(d.getTime())) return null;
        return { date: h, amount: Number(sub.price) || 0, currency: sub.currency || "EUR" };
      }
      if (h && typeof h === "object") {
        const date = typeof h.date === "string" ? h.date : "";
        const d = new Date(date);
        if (!date || Number.isNaN(d.getTime())) return null;
        return {
          date,
          amount: typeof h.amount === "number" ? h.amount : Number(h.amount) || Number(sub.price) || 0,
          currency: h.currency || sub.currency || "EUR",
        };
      }
      return null;
    })
    .filter(Boolean);
}

function getAllPaymentEvents(sub) {
  // Events = normalized history + current datePaid as an event (if valid)
  const events = normalizeHistory(sub);
  if (sub.datePaid) {
    const d = new Date(sub.datePaid);
    if (!Number.isNaN(d.getTime())) {
      events.push({
        date: sub.datePaid,
        amount: Number(sub.price) || 0,
        currency: sub.currency || "EUR",
      });
    }
  }

  // Sort desc for display
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  // De-dupe (date+amount+currency)
  const seen = new Set();
  const deduped = [];
  for (const e of events) {
    const key = `${e.date}|${e.amount}|${e.currency}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
  }
  return deduped;
}

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const premium = usePremium();

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    if (!premium.isPremium) navigate("/dashboard");
  }, [premium, navigate]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    setSubscriptions(Array.isArray(saved) ? saved : []);
  }, []);

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
        ? convert(Number(item.price) || 0, base, preferredCurrency, rates)
        : Number(item.price) || 0;

    return converted * cfg.monthlyFactor;
  };

  const totalMonthly = subscriptions.reduce((sum, item) => sum + monthlyCost(item), 0);

  const categoryTotals = subscriptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + monthlyCost(item);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || t("none");

  const highestSub =
    subscriptions.length === 0
      ? null
      : subscriptions.reduce((p, c) => (Number(p.price) > Number(c.price) ? p : c));

  const highestSubConverted =
    rates && highestSub
      ? convert(
        Number(highestSub.price) || 0,
        highestSub.currency || "EUR",
        preferredCurrency,
        rates
      )
      : Number(highestSub?.price) || 0;

  const freqCount = subscriptions.reduce((acc, item) => {
    acc[item.frequency] = (acc[item.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreq =
    subscriptions.length === 0
      ? "-"
      : Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0][0];

  // Total payments across all subscriptions
  const totalPayments = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + getAllPaymentEvents(sub).length, 0);
  }, [subscriptions]);

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

        <InsightsCard title={t("dashboard_top_category")} value={topCategory} Icon={TagIcon} />

        <InsightsCard
          title={t("dashboard_highest_sub")}
          value={
            highestSub
              ? `${highestSub.name} (${preferredCurrency} ${highestSubConverted.toFixed(2)})`
              : t("none")
          }
          Icon={ArrowTrendingUpIcon}
        />

        <InsightsCard
          title={t("dashboard_common_frequency")}
          value={mostCommonFreq === "-" ? "-" : t(`frequency_${mostCommonFreq}`)}
          Icon={ArrowPathIcon}
        />
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white text-center">
          {t("insights_payment_history")}
        </h2>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t("total_payments")}: <span className="font-semibold">{totalPayments}</span>
        </div>

        {subscriptions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">{t("insights_no_subscriptions")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700">
                  <th className="py-2 px-2">{t("subscription")}</th>
                  <th className="py-2 px-2">{t("frequency")}</th>
                  <th className="py-2 px-2">{t("total_payments")}</th>
                  <th className="py-2 px-2">{t("previous_payments")}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const events = getAllPaymentEvents(sub);

                  const formattedDates = events
                    .slice(0, 8)
                    .map((e) => new Date(e.date).toLocaleDateString())
                    .join(", ");

                  return (
                    <tr key={sub.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="py-2 px-2 font-medium text-gray-900 dark:text-gray-100">
                        {sub.name}
                      </td>
                      <td className="py-2 px-2 capitalize text-gray-600 dark:text-gray-400">
                        {t(`frequency_${sub.frequency}`)}
                      </td>
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                        {events.length}
                      </td>
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                        {formattedDates || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* EXPORT */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              // CSV rows: include amount + currency now
              const csvRows = [
                ["Subscription", "Frequency", "Payment Date", "Amount", "Currency"],
              ];

              subscriptions.forEach((sub) => {
                const events = getAllPaymentEvents(sub);

                // Export newest -> oldest
                events.forEach((e) => {
                  csvRows.push([
                    sub.name,
                    sub.frequency,
                    e.date, // keep ISO for Excel safety
                    String(e.amount ?? ""),
                    e.currency || sub.currency || "EUR",
                  ]);
                });
              });

              const csvContent = csvRows.map((row) => row.join(",")).join("\n");
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "subscription_payment_history.csv";
              link.click();
            }}
            className="px-4 py-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl"
          >
            {t("button_export_payment_history")}
          </button>
        </div>
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

      <PaymentTimelineChart subscriptions={subscriptions} />
    </div>
  );
}

function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </Card>
  );
}
