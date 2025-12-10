// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
import CurrencySelector from "../components/CurrencySelector";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";

/** -------------------------------------------------------------
 * Shared frequency config (matches SubscriptionItem & Insights)
 * ------------------------------------------------------------- */
const FREQ = {
  monthly: { months: 1 },
  weekly: { days: 7 },
  biweekly: { days: 14 },
  quarterly: { months: 3 },
  semiannual: { months: 6 },
  nine_months: { months: 9 },
  yearly: { months: 12 },
  biennial: { months: 24 },
  triennial: { months: 36 },
};

function computeNextRenewal(datePaid, frequency) {
  if (!datePaid) return null;

  const start = new Date(datePaid);
  if (Number.isNaN(start.getTime())) return null;

  const next = new Date(start);
  const cfg = FREQ[frequency] || FREQ.monthly;

  if (cfg.months) next.setMonth(start.getMonth() + cfg.months);
  if (cfg.days) next.setDate(start.getDate() + cfg.days);

  return next;
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("selected_currency") || "EUR"
  );
  const [rates, setRates] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();

  // Load subscriptions
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      if (Array.isArray(saved)) setSubscriptions(saved);
    } catch {
      setSubscriptions([]);
    }
  }, []);

  // Load FX
  useEffect(() => {
    fetchRates("EUR").then((r) => {
      if (r) setRates(r);
    });
  }, []);

  // Notifications for renewals
  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  const handleCurrency = (value) => {
    if (!premium.isPremium) {
      navigate("/premium?reason=currency");
      return;
    }
    setCurrency(value);
    localStorage.setItem("selected_currency", value);
  };

  // Sorted by next renewal date (soonest first)
  const sorted = subscriptions
    .slice()
    .sort((a, b) => {
      const nextA = computeNextRenewal(a.datePaid, a.frequency);
      const nextB = computeNextRenewal(b.datePaid, b.frequency);

      if (!nextA && !nextB) return 0;
      if (!nextA) return 1;
      if (!nextB) return -1;

      return nextA - nextB;
    });

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-20">
      <TrialBanner />

      <div className="mt-2 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        {hasSubscriptions && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">{t("dashboard_title")}</h1>

            {premium.isPremium ? (
              <CurrencySelector value={currency} onChange={handleCurrency} />
            ) : (
              <button
                onClick={() => navigate("/premium?reason=currency")}
                className="px-3 py-2 text-xs rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              >
                EUR · {t("premium_locked_currency")}
              </button>
            )}
          </div>
        )}

        {!hasSubscriptions && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6 mb-2">
            <p className="mb-3">{t("dashboard_empty")}</p>
            <Link
              to="/add"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("dashboard_empty_cta")}
            </Link>
          </div>
        )}

        {hasSubscriptions && (
          <div className="space-y-3 mt-3">
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
                onUpdatePaidDate={(id, newDate) => {
                  const updated = subscriptions.map((s) =>
                    s.id === id ? { ...s, datePaid: newDate } : s
                  );
                  setSubscriptions(updated);
                  localStorage.setItem(
                    "subscriptions",
                    JSON.stringify(updated)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
