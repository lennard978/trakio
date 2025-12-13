// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

/* ------------------------------------------------------------------ */
/* KV helpers                                                         */
/* ------------------------------------------------------------------ */
async function kvGet(email) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get", email }),
  });
  if (!res.ok) throw new Error("KV get failed");
  const data = await res.json();
  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

async function kvSave(email, subscriptions) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", email, subscriptions }),
  });
  if (!res.ok) throw new Error("KV save failed");
}

/* ------------------------------------------------------------------ */

export default function Dashboard({ currency }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const { t } = useTranslation();
  const premium = usePremium();
  const { user } = useAuth();
  const email = user?.email;

  /* ---------------- Load from KV only ---------------- */
  useEffect(() => {
    if (!email) return;

    (async () => {
      try {
        const list = await kvGet(email);
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
  }, [email]);

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

  const persist = async (nextSubs) => {
    setSubscriptions(nextSubs);
    if (!email) return;
    try {
      await kvSave(email, nextSubs);
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

      {hasSubscriptions && (
        <UpcomingPayments
          subscriptions={subscriptions}
          currency={preferredCurrency}
          rates={rates}
          convert={convert}
        />
      )}

      {hasSubscriptions && (
        <MonthlyBudget
          subscriptions={subscriptions}
          currency={preferredCurrency}
        />
      )}

      {premium.isPremium && (
        <ForgottenSubscriptions subscriptions={subscriptions} />
      )}

      {hasSubscriptions && (
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

                  const history = Array.isArray(s.history) ? [...s.history] : [];

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
