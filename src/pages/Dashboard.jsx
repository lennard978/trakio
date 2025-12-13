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

  const { user } = useAuth();
  const email = user?.email;

  const loadFromLocal = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      return Array.isArray(saved) ? saved.map(ensureId) : [];
    } catch {
      return [];
    }
  };

  const saveToKV = async (subs) => {
    if (!email) return;
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        email,
        subscriptions: subs,
      }),
    });
  };

  const persistSubscriptions = async (subs) => {
    setSubscriptions(subs);

    // Keep localStorage temporarily (rollback safety)
    localStorage.setItem("subscriptions", JSON.stringify(subs));

    // Write to KV
    await saveToKV(subs);
  };


  useEffect(() => {
    if (!email) return;

    const load = async () => {
      try {
        // 1️⃣ Try KV
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", email }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.subscriptions) && data.subscriptions.length > 0) {
            const fixed = data.subscriptions.map(ensureId);
            setSubscriptions(fixed);
            return;
          }
        }

        // 2️⃣ Fallback to localStorage
        const local = loadFromLocal();
        setSubscriptions(local);

        // 3️⃣ One-time migration to KV
        if (local.length > 0) {
          await saveToKV(local);
        }
      } catch (err) {
        console.error("Subscription load failed:", err);
        setSubscriptions(loadFromLocal());
      }
    };

    load();
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
          <MonthlyBudget
            subscriptions={subscriptions}
            currency={preferredCurrency}
          />
        )}

        {premium.isPremium && (
          <ForgottenSubscriptions subscriptions={subscriptions} />
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
                  persistSubscriptions(updated);
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

                    const newHistory = s.datePaid
                      ? [...(Array.isArray(s.history) ? s.history : []), s.datePaid]
                      : Array.isArray(s.history)
                        ? s.history
                        : [];

                    return {
                      ...s,
                      datePaid: newDate,
                      history: newHistory,
                      priceHistory,
                      priceAlert: alert || null,
                    };
                  });
                  persistSubscriptions(updated);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
