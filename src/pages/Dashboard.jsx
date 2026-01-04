import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { computeNextRenewal } from "../utils/renewal";
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
import DashboardLoading from "../components/dasboard/DashboardLoading";
import OfflineNotice from "../components/dasboard/OfflineNotice";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const premium = usePremium();
  const { currency } = useCurrency();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const { subscriptions, loading, persist } = useSubscriptions(user);
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;

  const previousMonthTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return subscriptions.reduce((sum, s) => {
      if (!Array.isArray(s.payments)) return sum;

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const lastMonthPayments = s.payments.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });

      return sum + lastMonthPayments.reduce((sub, p) => sub + Number(p.amount || s.price || 0), 0);
    }, 0);
  }, [subscriptions]);

  const totalMonthly = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return subscriptions.reduce((sum, s) => {
      if (!Array.isArray(s.payments)) return sum;

      const payments = s.payments.filter((p) => {
        const date = new Date(p.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      return sum + payments.reduce((total, p) => total + Number(p.amount || 0), 0);
    }, 0);
  }, [subscriptions]);

  const monthlyChange = useMemo(() => {
    if (!previousMonthTotal || previousMonthTotal === 0) return null;
    return ((totalMonthly - previousMonthTotal) / previousMonthTotal) * 100;
  }, [totalMonthly, previousMonthTotal]);

  const annualCost = useMemo(() => getAnnualCost(subscriptions), [subscriptions]);

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <TrialBanner />

      {loading && !navigator.onLine && <OfflineNotice />}
      {loading ? (
        <DashboardLoading />
      ) : hasSubscriptions ? (
        <>
          <SummaryCards
            currency={preferredCurrency}
            totalMonthly={totalMonthly}
            annualCost={annualCost}
            monthlyChange={monthlyChange}
          />

          <UpcomingPayments subscriptions={subscriptions} currency={preferredCurrency} />
          <MonthlyBudget subscriptions={subscriptions} currency={preferredCurrency} />
          {premium.isPremium && <ForgottenSubscriptions subscriptions={subscriptions} />}

          <div className="space-y-2 mt-2">
            {subscriptions.map((sub) => (
              <SubscriptionItem
                key={sub.id}
                item={sub}
                theme={theme}
                currency={preferredCurrency}
                onDelete={(id) => persist(subscriptions.filter((s) => s.id !== id))}
                onMarkPaid={(id, date) => {
                  const updated = subscriptions.map((s) => {
                    if (s.id !== id) return s;

                    const payments = Array.isArray(s.payments) ? s.payments : [];
                    if (payments.some((p) => p.date === date)) return s;

                    return {
                      ...s,
                      payments: [
                        ...payments,
                        {
                          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                          date,
                          amount: s.price,
                          currency: s.currency || "EUR",
                        },
                      ],
                    };
                  });

                  persist(updated);
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyDashboardState />
      )}
    </div>
  );
}
