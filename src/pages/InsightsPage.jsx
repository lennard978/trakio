import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ClockIcon, // NEW ICON for payment count
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import PaymentTimelineChart from "../components/PaymentTimelineChart";

import Analytics from "../components/Analytics";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";
import SettingButton from "../components/ui/SettingButton";
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
    setSubscriptions(saved);
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
        ? convert(item.price, base, preferredCurrency, rates)
        : item.price;

    return converted * cfg.monthlyFactor;
  };

  const totalMonthly = subscriptions.reduce(
    (sum, item) => sum + monthlyCost(item),
    0
  );

  const categoryTotals = subscriptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + monthlyCost(item);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    t("none");

  const highestSub =
    subscriptions.length === 0
      ? null
      : subscriptions.reduce((p, c) => (p.price > c.price ? p : c));

  const highestSubConverted =
    rates && highestSub
      ? convert(
        highestSub.price,
        highestSub.currency || "EUR",
        preferredCurrency,
        rates
      )
      : highestSub?.price || 0;

  const freqCount = subscriptions.reduce((acc, item) => {
    acc[item.frequency] = (acc[item.frequency] || 0) + 1;
    return acc;
  }, {});

  const mostCommonFreq =
    subscriptions.length === 0
      ? "-"
      : Object.entries(freqCount).sort((a, b) => b[1] - a[1])[0][0];

  // ✅ NEW: Total number of payments (from history[] + datePaid)
  const totalPayments = [
    ...(Array.isArray(subscriptions.history) ? subscriptions.history : []),
    ...(subscriptions.datePaid ? [subscriptions.datePaid] : [])
  ].filter((d) => !isNaN(new Date(d).getTime())).length;



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

        <InsightsCard
          title={t("dashboard_top_category")}
          value={topCategory}
          Icon={TagIcon}
        />

        <InsightsCard
          title={t("dashboard_highest_sub")}
          value={
            highestSub
              ? `${highestSub.name} (${preferredCurrency} ${highestSubConverted.toFixed(
                2
              )})`
              : t("none")
          }
          Icon={ArrowTrendingUpIcon}
        />

        <InsightsCard
          title={t("dashboard_common_frequency")}
          value={
            mostCommonFreq === "-" ? "-" : t(`frequency_${mostCommonFreq}`)
          }
          Icon={ArrowPathIcon}
        />

        {/* ✅ NEW Payment History card */}
        {/* <InsightsCard
          title={t("dashboard_total_payments")}
          value={`${totalPayments} ${t("payments")}`}
          Icon={ClockIcon} // you'll need to import this icon
        /> */}
        {/* SUBSCRIPTION PAYMENT HISTORY TABLE */}
        <div className="rounded-2xl
        bg-white/90 dark:bg-black/30
        border border-gray-300/60 dark:border-white/10
        backdrop-blur-xl
        shadow-[0_8px_25px_rgba(0,0,0,0.08)]
        dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
        transition-all
        flex flex-col items-center gap-3 py-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white text-center">
            {t("insights_payment_history")}
          </h2>

          {subscriptions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              {t("insights_no_subscriptions")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-center text-gray-600 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700">
                    <th className="py-2 px-2">{t("subscription")}</th>
                    <th className="py-2 px-2">{t("frequency")}</th>
                    <th className="py-2 px-2">{t("total_payments")}</th>
                    <th className="py-2 px-2 text-center">{t("previous_payments")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const allPayments = [
                      ...(Array.isArray(sub.history) ? sub.history : []),
                      ...(sub.datePaid ? [sub.datePaid] : []),
                    ].filter((d) => !isNaN(new Date(d).getTime()));

                    const formattedDates = allPayments
                      .slice()
                      .sort((a, b) => new Date(b) - new Date(a))
                      .map((d) => new Date(d).toLocaleDateString())
                      .join(", ");

                    return (
                      <tr
                        key={sub.id}
                        className="border-b text-center border-gray-200 dark:border-gray-800"
                      >
                        <td className="py-2 px-2 font-medium text-gray-900 dark:text-gray-100">
                          {sub.name}
                        </td>
                        <td className="py-2 px-2 capitalize text-gray-600 dark:text-gray-400">
                          {t(`frequency_${sub.frequency}`)}
                        </td>
                        <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                          {allPayments.length}
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
          <div className="w-2/3 mt-2">
            <SettingButton variant="primary" onClick={() => navigate("/dashboard")}>
              Export payment history (CSV)
            </SettingButton>
          </div>
        </div>

      </div>

      <Analytics subscriptions={subscriptions} />
      <PaymentTimelineChart subscriptions={subscriptions} />

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

    </div>
  );
}

function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </Card>
  );
}
