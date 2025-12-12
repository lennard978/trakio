// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SubscriptionItem from "../components/SubscriptionItem";
import TrialBanner from "../components/TrialBanner";
import useNotifications from "../hooks/useNotifications";
import { fetchRates, convert } from "../utils/fx";
import { usePremium } from "../hooks/usePremium";
import useSubscriptionsKV from "../hooks/useSubscriptionsKV";
import { migrateLocalToKV } from "../utils/migrateLocalToKV";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard({ currency }) {
  const { t } = useTranslation();
  const premium = usePremium();
  const { user } = useAuth();

  const {
    subscriptions,
    loading,
    update,
    remove,
  } = useSubscriptionsKV();

  const [rates, setRates] = React.useState(null);

  // Run migration AFTER login (safe)
  useEffect(() => {
    if (user) migrateLocalToKV(user);
  }, [user]);

  useEffect(() => {
    fetchRates("EUR").then((r) => r && setRates(r));
  }, []);

  useNotifications(subscriptions);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-8">
        {t("loading")}
      </div>
    );
  }

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-6">
      <TrialBanner />

      {!hasSubscriptions ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-6 mb-2">
          <p className="mb-3">{t("dashboard_empty")}</p>
          <Link
            to="/add"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t("dashboard_empty_cta")}
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t("dashboard_title")}
          </h1>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <SubscriptionItem
                key={sub.id}
                item={sub}
                currency={preferredCurrency}
                rates={rates}
                convert={convert}
                onDelete={(id) => remove(id)}
                onUpdatePaidDate={(id, newDate) => {
                  const updated = {
                    ...sub,
                    datePaid: newDate,
                    history: [
                      ...(sub.history || []),
                      {
                        date: newDate,
                        amount: Number(sub.price) || 0,
                        currency: sub.currency || "EUR",
                      },
                    ],
                  };

                  update(updated);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
