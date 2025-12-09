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
    const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    setSubscriptions(saved);
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

  // Sorting by next renewal date
  const freqMap = {
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

  return (
    <div className="mt-2 pb-20">
      <TrialBanner />

      {hasSubscriptions && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">{t("dashboard_title")}</h1>

          {premium.isPremium ? (
            <CurrencySelector value={currency} onChange={handleCurrency} />
          ) : (
            <button
              onClick={() => navigate("/premium?reason=currency")}
              className="px-3 py-2 text-xs rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            >
              EUR · {t("premium_locked_currency")}
            </button>
          )}
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
                localStorage.setItem("subscriptions", JSON.stringify(updated));
              }}
              onUpdatePaidDate={(id, newDate) => {
                const updated = subscriptions.map((s) =>
                  s.id === id ? { ...s, datePaid: newDate } : s
                );
                setSubscriptions(updated);
                localStorage.setItem("subscriptions", JSON.stringify(updated));
              }}
            />

          ))}
        </div>
      )}
    </div>
  );
}
