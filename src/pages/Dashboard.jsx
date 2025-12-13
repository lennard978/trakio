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
import { detectPriceIncrease } from "../utils/priceAlert";
import ForgottenSubscriptions from "../components/ForgottenSubscriptions";
import { computeNextRenewal } from "../utils/renewal";
import { useAuth } from "../hooks/useAuth";

function normalizeSubscription(sub) {
  const currency = sub.currency || "EUR";
  const price = Number(sub.price || 0);

  const history = Array.isArray(sub.history) ? sub.history : [];
  const normalizedHistory = history
    .map((h) => {
      // Support legacy string history
      if (typeof h === "string") return { date: h, amount: price, currency };
      // Support object history
      if (h && typeof h === "object" && h.date) {
        return {
          date: h.date,
          amount: Number(h.amount ?? price),
          currency: h.currency || currency,
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    ...sub,
    id: sub.id || crypto.randomUUID(),
    price,
    currency,
    history: normalizedHistory,
  };
}

async function kvGet(email) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get", email }),
  });
  if (!res.ok) throw new Error(`KV get failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

async function kvSave(email, subscriptions) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", email, subscriptions }),
  });
  if (!res.ok) throw new Error(`KV save failed: ${res.status}`);
  return res.json();
}

export default function Dashboard({ currency }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  const { t } = useTranslation();
  const premium = usePremium();
  const { user } = useAuth();
  const email = user?.email;

  // Load from KV only
  useEffect(() => {
    if (!email) return;

    (async () => {
      try {
        const list = await kvGet(email);
        setSubscriptions(list.map(normalizeSubscription));
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
    } catch (e) {
      console.error("KV save failed:", e);
      // Optional: show toast here if you want
    }
  };

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
          <UpcomingPayments
            subscriptions={subscriptions}
            currency={preferredCurrency}
            rates={rates}
            convert={convert}
          />
        )}

        {hasSubscriptions && (
          <MonthlyBudget subscriptions={subscriptions} currency={preferredCurrency} />
        )}

        {premium.isPremium && <ForgottenSubscriptions subscriptions={subscriptions} />}

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
                  persist(updated);
                }}
                onUpdatePaidDate={(id, newDate) => {
                  const updated = subscriptions.map((s) => {
                    if (s.id !== id) return s;

                    const previousPrice =
                      Array.isArray(s.priceHistory) && s.priceHistory.length > 0
                        ? s.priceHistory[s.priceHistory.length - 1].price
                        : s.price;

                    const alert = detectPriceIncrease({
                      previousPrice,
                      newPrice: s.price,
                    });

                    const priceHistory = [
                      ...(Array.isArray(s.priceHistory) ? s.priceHistory : []),
                      {
                        date: newDate,
                        price: s.price,
                        currency: s.currency || "EUR",
                      },
                    ];

                    const history = Array.isArray(s.history) ? [...s.history] : [];
                    // Store as object (standard)
                    history.push({
                      date: newDate,
                      amount: Number(s.price),
                      currency: s.currency || "EUR",
                    });

                    return {
                      ...s,
                      datePaid: newDate,
                      history,
                      priceHistory,
                      priceAlert: alert || null,
                    };
                  });

                  persist(updated);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
