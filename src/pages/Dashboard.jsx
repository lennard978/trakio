// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";

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

  // Ensure subscription has a unique ID
  const ensureId = (sub) => ({
    ...sub,
    id: sub.id || crypto.randomUUID(),
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      const fixed = Array.isArray(saved) ? saved.map(ensureId) : [];
      setSubscriptions(fixed);
      localStorage.setItem("subscriptions", JSON.stringify(fixed));
    } catch {
      setSubscriptions([]);
    }
  }, []);

  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  const sorted = subscriptions.slice().sort((a, b) => {
    const nextA = computeNextRenewal(a.datePaid, a.frequency);
    const nextB = computeNextRenewal(b.datePaid, b.frequency);
    if (!nextA && !nextB) return 0;
    if (!nextA) return 1;
    if (!nextB) return -1;
    return nextA - nextB;
  });

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-6">
      <TrialBanner />

      <div>
        {hasSubscriptions ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              {t("dashboard_title")}
            </h1>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6 mb-2">
            <p className="mb-3">{t("dashboard_empty")}</p>
            <Link to="/add" className="text-blue-600 dark:text-blue-400 hover:underline">
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
                  const updated = subscriptions.map((s) => {
                    if (s.id === id) {
                      const newHistory = s.datePaid
                        ? [...(Array.isArray(s.history) ? s.history : []), s.datePaid]
                        : Array.isArray(s.history) ? s.history : [];

                      return {
                        ...s,
                        datePaid: newDate,
                        history: newHistory,
                      };
                    }
                    return s;
                  });

                  setSubscriptions(updated);
                  localStorage.setItem("subscriptions", JSON.stringify(updated));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {hasSubscriptions && (
        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(subscriptions, null, 2);
              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "subscriptions.json";
              link.click();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Export Subscriptions
          </button>

          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const imported = JSON.parse(event.target.result);
                  const fixed = Array.isArray(imported) ? imported.map(ensureId) : [];
                  setSubscriptions(fixed);
                  localStorage.setItem("subscriptions", JSON.stringify(fixed));
                } catch {
                  alert("Error importing data");
                }
              };
              reader.readAsText(file);
            }}
            className="bg-white dark:bg-black text-sm"
          />
        </div>
      )}
    </div>
  );
}
