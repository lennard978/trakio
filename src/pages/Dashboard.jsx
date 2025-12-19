import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../utils/api";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
import { usePremium } from "../hooks/usePremium";
import UpcomingPayments from "../components/UpcomingPayments";
import MonthlyBudget from "../components/MonthlyBudget";
import ForgottenSubscriptions from "../components/ForgottenSubscriptions";
import { computeNextRenewal } from "../utils/renewal";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../context/CurrencyContext";

/* ------------------------------------------------------------------ */
/* KV helpers */
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

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const premium = usePremium();
  const { currency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState([]);

  /* ---------------- Filters ---------------- */
  const [filters, setFilters] = useState({
    year: "",
    category: "",
    paymentMethod: "",
    currency: "",
  });

  /* ---------------- Sorting (MUST be before useMemo) ---------------- */
  const [sortBy, setSortBy] = useState("next"); // next | price | name | progress

  /* ---------------- Load & migrate ---------------- */
  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      try {
        const list = await kvGet(user.email);

        const migrated = list.map((s) => {
          let payments = Array.isArray(s.payments) ? [...s.payments] : [];

          // Legacy migration (one-time)
          if (Array.isArray(s.history)) {
            s.history.forEach((d) => {
              payments.push({
                id: crypto.randomUUID(),
                date: d,
                amount: s.price,
                currency: s.currency || "EUR",
              });
            });
          }

          if (s.datePaid) {
            payments.push({
              id: crypto.randomUUID(),
              date: s.datePaid,
              amount: s.price,
              currency: s.currency || "EUR",
            });
          }

          return {
            ...s,
            id: s.id || crypto.randomUUID(),
            payments,
            color: s.color || "#ffffff", // ✅ ensure it's carried forward
            history: undefined,
            datePaid: undefined,
          };
        });

        setSubscriptions(migrated);
      } catch (err) {
        console.error("Subscription load failed:", err);
        setSubscriptions([]);
      }
    })();
  }, [user?.email]);

  /* ---------------- Notifications ---------------- */
  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  /* ---------------- Filtering ---------------- */
  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const lastPayment = s.payments?.length
        ? new Date(Math.max(...s.payments.map((p) => new Date(p.date))))
        : null;

      const paidYear = lastPayment
        ? lastPayment.getFullYear().toString()
        : "";

      return (
        (!filters.year || paidYear === filters.year) &&
        (!filters.category || s.category === filters.category) &&
        (!filters.paymentMethod ||
          s.paymentMethod === filters.paymentMethod) &&
        (!filters.currency || s.currency === filters.currency)
      );
    });
  }, [subscriptions, filters]);

  /* ---------------- Sorting ---------------- */
  const sorted = useMemo(() => {
    return filtered.slice().sort((a, b) => {
      switch (sortBy) {

        case "name":
          return (a.name || "").localeCompare(b.name || "");

        case "progress": {
          const nextA = computeNextRenewal(a.payments, a.frequency);
          const nextB = computeNextRenewal(b.payments, b.frequency);

          if (!nextA && !nextB) return 0;
          if (!nextA) return 1;
          if (!nextB) return -1;

          const lastA = Math.max(...a.payments.map((p) => new Date(p.date).getTime()));
          const lastB = Math.max(...b.payments.map((p) => new Date(p.date).getTime()));

          const totalA = nextA.getTime() - lastA;
          const totalB = nextB.getTime() - lastB;

          if (totalA <= 0 || totalB <= 0) return 0;

          const progA = (Date.now() - lastA) / totalA;
          const progB = (Date.now() - lastB) / totalB;

          return progB - progA;
        }


        case "next":
        default: {
          const nextA = computeNextRenewal(a.payments, a.frequency);
          const nextB = computeNextRenewal(b.payments, b.frequency);

          if (!nextA && !nextB) return 0;
          if (!nextA) return 1;
          if (!nextB) return -1;
          return nextA - nextB;
        }
      }
    });
  }, [filtered, sortBy]);

  /* ---------------- Persist helper ---------------- */
  const persist = async (nextSubs) => {
    setSubscriptions(nextSubs);
    try {
      await kvSave(nextSubs);
    } catch (err) {
      console.error("KV save failed:", err);
    }
  };

  /* ---------------- Render ---------------- */
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

      {hasSubscriptions && (
        <UpcomingPayments
          subscriptions={filtered}
          currency={preferredCurrency}
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

      {sorted.length > 0 && (
        <div className="space-y-3 mt-4">
          {sorted.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              item={sub}
              currency={preferredCurrency}
              onDelete={(id) =>
                persist(subscriptions.filter((s) => s.id !== id))
              }
              onMarkPaid={(id, date) => {
                const updated = subscriptions.map((s) =>
                  s.id !== id
                    ? s
                    : {
                      ...s,
                      payments: [
                        ...(Array.isArray(s.payments)
                          ? s.payments
                          : []),
                        {
                          id: crypto.randomUUID(),
                          date,
                          amount: s.price,
                          currency: s.currency || "EUR",
                        },
                      ],
                    }
                );

                persist(updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
