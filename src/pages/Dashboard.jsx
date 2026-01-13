import React, { useMemo, useCallback, useState } from "react";
import { getAnnualCost } from "../utils/annualCost";
import useNotifications from "../hooks/useNotifications";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../hooks/useTheme";
import { usePremium } from "../hooks/usePremium";
import { useSubscriptions } from "../hooks/useSubscriptions";

import TrialBanner from "../components/TrialBanner";
import UpcomingPayments from "../components/UpcomingPayments";
import MonthlyBudget from "../components/MonthlyBudget";
import ForgottenSubscriptions from "../components/ForgottenSubscriptions";
import SubscriptionItem from "../components/SubscriptionItem";
import EmptyDashboardState from "../components/dasboard/EmptyDashboardState";
import SummaryCards from "../components/dasboard/SummaryCards";
import DashboardLoading from "../components/dasboard/DashboardLoading.jsx";
import OfflineNotice from "../components/dasboard/OfflineNotice";
import DashboardFilterUI from "../components/DashboardFilterUI";
import PageLayout from "../components/layout/PageLayout";
import { computeNextRenewal } from "../utils/renewal";
import Card from "../components/ui/Card.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const premium = usePremium();
  const { currency } = useCurrency();
  const { theme } = useTheme();
  const { subscriptions, loading, persist } = useSubscriptions(user);

  const preferredCurrency = premium.isPremium ? currency : "EUR";

  /* ---------------- Filters ---------------- */

  const [filters, setFilters] = useState({
    year: "",
    category: "",
    paymentMethod: "",
    currency: "",
    sortBy: "next",
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ---------------- Notifications ---------------- */

  useNotifications(subscriptions);

  const hasSubscriptions =
    Array.isArray(subscriptions) && subscriptions.length > 0;

  /* ---------------- Derived / Filtered List ---------------- */

  const filteredSubscriptions = useMemo(() => {
    let list = [...subscriptions];

    // Category
    if (filters.category) {
      list = list.filter(
        (s) => (s.category || "").toLowerCase() === filters.category
      );
    }

    // Payment method
    if (filters.paymentMethod) {
      list = list.filter(
        (s) =>
          (s.method || "").toLowerCase() ===
          filters.paymentMethod.toLowerCase()
      );
    }

    // Currency (original subscription currency)
    if (filters.currency) {
      list = list.filter(
        (s) => (s.currency || "").toUpperCase() === filters.currency
      );
    }

    // Year (based on payments)
    if (filters.year) {
      const y = Number(filters.year);
      list = list.filter(
        (s) =>
          Array.isArray(s.payments) &&
          s.payments.some(
            (p) => new Date(p.date).getFullYear() === y
          )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case "price":
        list.sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "next":
      default:
        list.sort((a, b) => {
          const na = computeNextRenewal(a.payments || [], a.frequency);
          const nb = computeNextRenewal(b.payments || [], b.frequency);
          return (na || Infinity) - (nb || Infinity);
        });
    }

    return list;
  }, [subscriptions, filters]);

  /* ---------------- Monthly / Annual Stats ---------------- */

  const getPaymentsForMonth = useCallback((subs, month, year) => {
    return subs.reduce((sum, s) => {
      if (!Array.isArray(s.payments)) return sum;
      const payments = s.payments.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      return (
        sum +
        payments.reduce(
          (sub, p) => sub + Number(p.amount || s.price || 0),
          0
        )
      );
    }, 0);
  }, []);

  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const previousMonthTotal = useMemo(
    () => getPaymentsForMonth(subscriptions, prevMonth, prevYear),
    [subscriptions, getPaymentsForMonth, prevMonth, prevYear]
  );

  const totalMonthly = useMemo(
    () => getPaymentsForMonth(subscriptions, now.getMonth(), now.getFullYear()),
    [subscriptions, getPaymentsForMonth, now]
  );

  const monthlyChange = useMemo(() => {
    if (!previousMonthTotal || previousMonthTotal === 0) return null;
    return ((totalMonthly - previousMonthTotal) / previousMonthTotal) * 100;
  }, [totalMonthly, previousMonthTotal]);

  const annualCost = useMemo(
    () => (Array.isArray(subscriptions) ? getAnnualCost(subscriptions) : 0),
    [subscriptions]
  );

  /* ---------------- Actions ---------------- */

  const handleDelete = useCallback(
    (id) => persist(subscriptions.filter((s) => s.id !== id)),
    [subscriptions, persist]
  );

  const handleMarkPaid = useCallback(
    (id, date) => {
      const updated = subscriptions.map((s) => {
        if (s.id !== id) return s;
        const payments = Array.isArray(s.payments) ? s.payments : [];
        if (payments.some((p) => p.date === date)) return s;

        return {
          ...s,
          payments: [
            ...payments,
            {
              id: `${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`,
              date,
              amount: s.price,
              currency: s.currency || "EUR",
            },
          ],
        };
      });
      persist(updated);
    },
    [subscriptions, persist]
  );

  const summaryProps = useMemo(
    () => ({
      currency: preferredCurrency,
      totalMonthly,
      annualCost,
      monthlyChange,
    }),
    [preferredCurrency, totalMonthly, annualCost, monthlyChange]
  );

  /* ---------------- Render ---------------- */

  return (
    <PageLayout maxWidth="max-w-2xl">
      <Card>
        <TrialBanner />

        {loading &&
          typeof navigator !== "undefined" &&
          !navigator.onLine && <OfflineNotice />}

        {loading ? (
          <DashboardLoading />
        ) : hasSubscriptions ? (
          <>
            <SummaryCards {...summaryProps} />

            <UpcomingPayments
              subscriptions={filteredSubscriptions}
              currency={preferredCurrency}
            />

            <MonthlyBudget
              subscriptions={filteredSubscriptions}
              currency={preferredCurrency}
            />

            {premium.isPremium && (
              <ForgottenSubscriptions
                subscriptions={filteredSubscriptions}
              />
            )}

            {/* ✅ FILTERS – placed before filtered content */}
            <DashboardFilterUI
              {...filters}
              onChange={handleFilterChange}
            />

            <div className="space-y-3">
              {filteredSubscriptions.map((sub) => (
                <SubscriptionItem
                  key={sub.id}
                  item={sub}
                  theme={theme}
                  currency={preferredCurrency}
                  onDelete={handleDelete}
                  onMarkPaid={handleMarkPaid}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyDashboardState />
        )}
      </Card>
    </PageLayout>

  );
}
