// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  const [loadingSubs, setLoadingSubs] = useState(true);

  const { t } = useTranslation();
  const premium = usePremium();

  const { user } = useAuth();
  const email = user?.email;

  // Ensure subscription has a unique ID
  const ensureId = (sub) => ({
    ...sub,
    id: sub.id || crypto.randomUUID(),
  });

  // --- KV helpers ------------------------------------------------------
  const saveToKV = async (subs) => {
    if (!email) return;

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        email,
        subscriptions: subs,
      }),
    });

    if (!res.ok) {
      // Do not break UI, but log for diagnosis
      const text = await res.text().catch(() => "");
      throw new Error(`KV save failed (${res.status}): ${text}`);
    }
  };

  const persistSubscriptions = (subs) => {
    // 1) Update UI immediately
    setSubscriptions(subs);

    // 2) Keep localStorage temporarily (rollback safety)
    try {
      localStorage.setItem("subscriptions", JSON.stringify(subs));
    } catch {
      // ignore localStorage failures (private mode / quota)
    }

    // 3) KV is source of truth (fire-and-forget, but logged)
    saveToKV(subs).catch((err) => {
      console.error("KV save error:", err);
    });
  };

  // --- KV-only load ----------------------------------------------------
  useEffect(() => {
    if (!email) {
      setSubscriptions([]);
      setLoadingSubs(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingSubs(true);

      try {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", email }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`KV get failed (${res.status}): ${text}`);
        }

        const data = await res.json();
        const list = Array.isArray(data.subscriptions) ? data.subscriptions : [];
        const fixed = list.map(ensureId);

        if (!cancelled) {
          setSubscriptions(fixed);

          // Optional: keep localStorage mirrored for now (rollback safety)
          try {
            localStorage.setItem("subscriptions", JSON.stringify(fixed));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error("Subscription KV load failed:", err);
        if (!cancelled) setSubscriptions([]);
      } finally {
        if (!cancelled) setLoadingSubs(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [email]);

  // --- FX rates --------------------------------------------------------
  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

  const preferredCurrency = premium.isPremium ? currency : "EUR";
  const hasSubscriptions = subscriptions.length > 0;

  const sorted = useMemo(() => {
    return subscriptions.slice().sort((a, b) => {
      const nextA = computeNextRenewal(a.datePaid, a.frequency);
      const nextB = computeNextRenewal(b.datePaid, b.frequency);
      if (!nextA && !nextB) return 0;
      if (!nextA) return 1;
      if (!nextB) return -1;
      return nextA - nextB;
    });
  }, [subscriptions]);

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-6">
      <TrialBanner />

      <div>
        {/* Loading state for KV fetch */}
        {loadingSubs ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6 mb-2">
            {t("loading") || "Loading..."}
          </div>
        ) : hasSubscriptions ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              {t("dashboard_title")}
            </h1>
          </div>
        ) : (
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

        {!loadingSubs && hasSubscriptions && (
          <UpcomingPayments
            subscriptions={subscriptions}
            currency={preferredCurrency}
            rates={rates}
            convert={convert}
          />
        )}

        {!loadingSubs && hasSubscriptions && (
          <MonthlyBudget subscriptions={subscriptions} currency={preferredCurrency} />
        )}

        {!loadingSubs && premium.isPremium && (
          <ForgottenSubscriptions subscriptions={subscriptions} />
        )}

        {!loadingSubs && hasSubscriptions && (
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
