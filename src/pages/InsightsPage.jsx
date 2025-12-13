import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyEuroIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";

import Analytics from "../components/Analytics";
import PaymentTimelineChart from "../components/PaymentTimelineChart";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

import { fetchRates, convert } from "../utils/fx";
import { exportPaymentHistoryCSV } from "../utils/exportCSV";

/* ------------------------------------------------------------------ */
/* Frequency normalization                                            */
/* ------------------------------------------------------------------ */
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

  const { user } = useAuth();
  const email = user?.email;

  const premium = usePremium();

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  /* ------------------------------------------------------------------ */
  /* Premium gate                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (premium.loaded && !premium.isPremium) {
      navigate("/dashboard");
    }
  }, [premium.loaded, premium.isPremium, navigate]);

  /* ------------------------------------------------------------------ */
  /* Load subscriptions from KV                                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!email) return;

    const load = async () => {
      try {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", email }),
        });

        if (!res.ok) throw new Error("Failed to load subscriptions");

        const data = await res.json();
        setSubscriptions(
          Array.isArray(data.subscriptions) ? data.subscriptions : []
        );
      } catch (err) {
        console.error("Insights load error:", err);
      }
    };

    load();
  }, [email]);

  /* ------------------------------------------------------------------ */
  /* FX rates                                                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Preferred currency                                                 */
  /* ------------------------------------------------------------------ */
  const preferredCurrency = useMemo(() => {
    return premium.isPremium
      ? localStorage.getItem("selected_currency") || "EUR"
      : "EUR";
  }, [premium.isPremium]);

  /* ------------------------------------------------------------------ */
  /* Calculations                                                       */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Total payments (history + datePaid)                                */
  /* ------------------------------------------------------------------ */
  const totalPayments = subscriptions.reduce((sum, sub) => {
    const payments = [
      ...(Array.isArray(sub.history) ? sub.history : []),
      ...(sub.datePaid ? [sub.datePaid] : []),
    ].filter((d) => !isNaN(new Date(d).getTime()));

    return sum + payments.length;
  }, 0);

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-4xl mx-auto p-2 pb-6 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {t("insights_title")}
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <Card className="mt-6 p-5">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {t("insights_payment_history")}
        </h2>

        {subscriptions.length === 0 ? (
          <p className="text-center text-gray-500">
            {t("insights_no_subscriptions")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Subscription</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Payments</th>
                  <th className="py-2">Dates</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const payments = [
                    ...(Array.isArray(sub.history) ? sub.history : []),
                    ...(sub.datePaid ? [sub.datePaid] : []),
                  ]
                    .filter((d) => !isNaN(new Date(d)))
                    .sort((a, b) => new Date(b) - new Date(a));

                  return (
                    <tr key={sub.id} className="border-b text-center">
                      <td className="py-2 font-medium">{sub.name}</td>
                      <td className="py-2 capitalize">
                        {t(`frequency_${sub.frequency}`)}
                      </td>
                      <td className="py-2">{payments.length}</td>
                      <td className="py-2">
                        {payments
                          .map((d) =>
                            new Date(d).toLocaleDateString()
                          )
                          .join(", ") || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <SettingButton
            variant="primary"
            onClick={() => exportPaymentHistoryCSV(subscriptions)}
          >
            {t("export_csv")}
          </SettingButton>
        </div>
      </Card>

      <Analytics subscriptions={subscriptions} />
      <PaymentTimelineChart subscriptions={subscriptions} />

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-4 px-4 py-2 rounded-xl border"
      >
        ← {t("button_back")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function InsightsCard({ title, value, Icon }) {
  return (
    <Card className="flex items-center gap-3 py-5">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </Card>
  );
}
