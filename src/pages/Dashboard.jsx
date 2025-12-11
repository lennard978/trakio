// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
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

export default function Dashboard({ currency }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

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

  // Load FX rates
  useEffect(() => {
    fetchRates("EUR").then((r) => {
      if (r) setRates(r);
    });
  }, []);

  // Notifications for renewals
  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

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

      <div className="">
        {hasSubscriptions && (
          <div className="flex items-center justify-between mb-4 p-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-2">
              {t("dashboard_title")}
            </h1>
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
