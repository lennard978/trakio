// src/pages/InsightsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { forecastSpend } from "../utils/forecast";
import useBudgetAlerts from "../hooks/useBudgetAlerts";

import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";
import { useCurrency } from "../context/CurrencyContext";
import { convert } from "../utils/currency";

import Card from "../components/ui/Card";
import BudgetOverviewChart from "../components/insights/BudgetOverviewChart";
import PremiumGuard from "../components/premium/PremiumGuard";
import PaymentAccordion from "../components/insights/PaymentAccordion";

// import { getCurrentMonthSpending } from "../utils/budget";
import { persistSubscriptions } from "../utils/persistSubscriptions";
import { loadSubscriptionsLocal, saveSubscriptionsLocal } from "../utils/mainDB";

export default function InsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const premium = usePremium();
  const { currency } = useCurrency();

  const email = user?.email;

  const [subscriptions, setSubscriptions] = useState([]);
  const [rates, setRates] = useState(null);

  /* ------------------------------------------------------------------ */
  /* FX Rates                                                           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!premium.loaded || premium.loading) return;
    if (!premium.isPremium) {
      navigate("/dashboard");
    }
  }, [premium.loaded, premium.loading, premium.isPremium, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        const res = await fetch("https://api.exchangerate.host/latest");
        const data = await res.json();
        if (!cancelled && data?.rates) {
          setRates(data.rates);
        }
      } catch {
        // silently fail – app still works in base currency
      }
    }

    loadRates();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Premium gate                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!premium.loaded || premium.loading) return;
    if (!premium.isPremium) {
      navigate("/dashboard");
    }
  }, [premium.loaded, premium.loading, premium.isPremium, navigate]);

  /* ------------------------------------------------------------------ */
  /* Load subscriptions (offline-first)                                 */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      // 1️⃣ local
      const local = await loadSubscriptionsLocal();
      if (!cancelled && local.length) {
        setSubscriptions(local);
      }

      // 2️⃣ backend
      if (navigator.onLine && token) {
        try {
          const res = await fetch("/api/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: "get", email }),
          });

          const data = await res.json();
          if (!cancelled && Array.isArray(data.subscriptions)) {
            setSubscriptions(data.subscriptions);
            await saveSubscriptionsLocal(data.subscriptions);
          }
        } catch {
          /* offline / ignored */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, token]);

  /* ------------------------------------------------------------------ */
  /* Delete payment                                                     */
  /* ------------------------------------------------------------------ */

  const deletePayment = async (subId, paymentId) => {
    const updated = subscriptions.map((s) =>
      s.id === subId
        ? { ...s, payments: s.payments.filter((p) => p.id !== paymentId) }
        : s
    );

    setSubscriptions(updated);
    await saveSubscriptionsLocal(updated);

    await persistSubscriptions({
      email,
      token,
      subscriptions: updated,
    });
  };

  /* ------------------------------------------------------------------ */
  /* Derived data                                                       */
  /* ------------------------------------------------------------------ */

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // const actualSpent = useMemo(() => {
  //   if (!rates) return 0;
  //   return getCurrentMonthSpending(
  //     subscriptions,
  //     currency,
  //     rates,
  //     convert
  //   );
  // }, [subscriptions, currency, rates]);

  const forecast30 = useMemo(() => {
    if (!rates) return null;
    return forecastSpend({
      subscriptions,
      fromDate: now,
      toDate: new Date(now.getTime() + 30 * 86400000),
      rates,
      convert: (amount, from) =>
        convert(amount, from, currency, rates),
    });
  }, [subscriptions, rates, now, currency]);

  /* ------------------------------------------------------------------ */
  /* Alerts                                                             */
  /* ------------------------------------------------------------------ */

  useBudgetAlerts({
    forecast30,
    currency,
    isPremium: premium.isPremium,
  });

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-5">
      <PremiumGuard>
        {/* <Card interactive> */}
        <BudgetOverviewChart
          subscriptions={subscriptions}
          rates={rates}
        />
        {/* </Card> */}
      </PremiumGuard>

      <Card interactive>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t("insights_payment_history")}
        </h2>

        <PaymentAccordion
          subscriptions={subscriptions}
          currency={currency}
          rates={rates}
          convert={convert}
          onDeletePayment={deletePayment}
        />
      </Card>
    </div>
  );
}
