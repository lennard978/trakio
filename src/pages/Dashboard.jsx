// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../utils/api";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";
import UpcomingPayments from "../components/UpcomingPayments";
import MonthlyBudget from "../components/MonthlyBudget";
import ForgottenSubscriptions from "../components/ForgottenSubscriptions";
import { computeNextRenewal } from "../utils/renewal";
import { useAuth } from "../hooks/useAuth";
import DashboardFilterUI from "../components/DashboardFilterUI";

/* ------------------------------------------------------------------ */
async function kvGet(email) {
  const data = await apiFetch("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({ action: "get", email }),
  });

  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

async function kvSave(subscriptions) {
  await apiFetch("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      action: "save",
      subscriptions,
    }),
  });
}

/* ------------------------------------------------------------------ */
export default function Dashboard({ currency }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const { t } = useTranslation();
  const premium = usePremium();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    year: "",
    category: "",
    paymentMethod: "",
    currency: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- Load subscriptions ---------------- */
  useEffect(() => {
    (async () => {
      try {
        if (!user?.email) return;

        const list = await kvGet(user.email);
        setSubscriptions(
          list.map((s) => ({
            ...s,
            id: s.id || crypto.randomUUID(),
            history: Array.isArray(s.history) ? s.history : [],
          }))
        );
      } catch (err) {
        console.error("Subscription load failed:", err);
        setSubscriptions([]);
      }
    })();
  }, [user?.email]);

  /* ---------------- FX rates ---------------- */
  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  /* ---------------- FILTER LOGIC ---------------- */
  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const paidYear = s.datePaid ? new Date(s.datePaid).getFullYear().toString() : "";

      return (
        (!filters.year || paidYear === filters.year) &&
        (!filters.category || s.category === filters.category) &&
        (!filters.paymentMethod || s.paymentMethod === filters.paymentMethod) &&
        (!filters.currency || s.currency === filters.currency)
      );
    });
  }, [subscriptions, filters]);

  const sorted = filtered.slice().sort((a, b) => {
    const nextA = computeNextRenewal(a.datePaid, a.frequency);
    const nextB = computeNextRenewal(b.datePaid, b.frequency);

    if (!nextA && !nextB) return 0;
    if (!nextA) return 1;
    if (!nextB) return -1;
    return nextA - nextB;
  });

  const persist = async (nextSubs) => {
    setSubscriptions(nextSubs);
    try {
      await kvSave(nextSubs);
    } catch (err) {
      console.error("KV save failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-6">
      <TrialBanner />

      {hasSubscriptions ? (
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("dashboard_title")}
        </h1>
      ) : (
        <div className="text-center text-gray-500 mt-6 mb-4">
          <p className="mb-3">{t("dashboard_empty")}</p>
          <Link to="/add" className="text-blue-600 hover:underline">
            {t("dashboard_empty_cta")}
          </Link>
        </div>
      )}

      <DashboardFilterUI
        year={filters.year}
        category={filters.category}
        paymentMethod={filters.paymentMethod}
        currency={filters.currency}
        onChange={handleFilterChange}
      />

      {hasSubscriptions && (
        <UpcomingPayments
          subscriptions={filtered}
          currency={preferredCurrency}
          rates={rates}
          convert={convert}
        />
      )}

      {hasSubscriptions && (
        <MonthlyBudget
          subscriptions={filtered}
          currency={preferredCurrency}
        />
      )}

      {premium.isPremium && (
        <ForgottenSubscriptions subscriptions={filtered} />
      )}

      {filtered.length > 0 && (
        <div className="space-y-3 mt-4">
          {sorted.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              item={sub}
              currency={preferredCurrency}
              rates={rates}
              convert={convert}
              onDelete={(id) => {
                persist(subscriptions.filter((s) => s.id !== id));
              }}
              onUpdatePaidDate={(id, newDate) => {
                const updated = subscriptions.map((s) => {
                  if (s.id !== id) return s;

                  const history = Array.isArray(s.history)
                    ? [...s.history]
                    : [];

                  if (s.datePaid && s.datePaid !== newDate) {
                    history.push(s.datePaid);
                  }

                  return {
                    ...s,
                    datePaid: newDate,
                    history,
                  };
                });

                persist(updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
