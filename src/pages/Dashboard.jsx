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
import { useTheme } from "../hooks/useTheme";
import EmptyDashboardState from "../components/dasboard/EmptyDashboardState";
import { MONTHLY_FACTOR } from "../utils/frequency";
import {
  isOnline,
  loadSubscriptionsLocal,
  saveSubscriptionsLocal,
  syncPending
} from "../utils/mainDB"; // update the path if needed

/* ------------------------------------------------------------------ */
/* KV helpers */
/* ------------------------------------------------------------------ */
async function kvGet(email) {
  const data = await apiFetch("pages/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({ action: "get", email }),
  });

  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

async function kvSave(subscriptions) {
  await apiFetch("pages/api/subscriptions", {
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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [loading, setLoading] = useState(true); // ← Add this
  const [syncStatus, setSyncStatus] = useState("");

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
        setLoading(true);

        let list = [];

        if (isOnline()) {
          // Fetch from API
          list = await kvGet(user.email);

          // Save to IndexedDB
          await saveSubscriptionsLocal(list);
        } else {
          // Load from IndexedDB
          console.log("🌀 Loading from IndexedDB (offline mode)");
          list = await loadSubscriptionsLocal();
        }

        // Migrate legacy data
        const migrated = list.map((s) => {
          let payments = Array.isArray(s.payments) ? [...s.payments] : [];

          // Legacy migration logic
          if (Array.isArray(s.history)) {
            s.history.forEach((d) => {
              payments.push({
                id: crypto.randomUUID(),
                date: d,
                color: s.color || "#ffffff",
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

          // Remove duplicates
          const seen = new Set();
          payments = payments.filter((p) => {
            const key = new Date(p.date).toISOString().slice(0, 10);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          return {
            ...s,
            id: s.id || crypto.randomUUID(),
            payments,
            color: s.color || "#ffffff",
            history: undefined,
            datePaid: undefined,
          };
        });

        setSubscriptions(migrated);
      } catch (err) {
        console.error("Subscription load failed:", err);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.email]);

  useEffect(() => {
    const syncOnReconnect = async () => {
      if (isOnline() && user?.email && localStorage.getItem("token")) {
        console.log("📡 Reconnected — syncing pending data...");
        await syncPending(user.email, localStorage.getItem("token"));
        const refreshed = await kvGet(user.email);

        if (Array.isArray(refreshed) && refreshed.length > 0) {
          await saveSubscriptionsLocal(refreshed);
          setSubscriptions(refreshed);
        } else {
          console.warn("⚠️ Backend returned empty list. Keeping local data.");
        }
      }
    };

    window.addEventListener("online", syncOnReconnect);
    return () => window.removeEventListener("online", syncOnReconnect);
  }, [user?.email]);

  useEffect(() => {
    const handleOnline = async () => {
      if (user?.email) {
        setSyncStatus("Syncing...");
        await syncPending(user.email, localStorage.getItem("token"));
        setSyncStatus("Synced!");
        setTimeout(() => setSyncStatus(""), 2000);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user?.email]);



  /* ---------------- Notifications ---------------- */
  useNotifications(subscriptions);

  const hasSubscriptions = subscriptions.length > 0;
  const preferredCurrency = premium.isPremium ? currency : "EUR";

  // 🔢 Calculate previous month total
  const previousMonthTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return subscriptions.reduce((sum, s) => {
      if (!Array.isArray(s.payments)) return sum;

      const lastMonthPayments = s.payments.filter((p) => {
        const d = new Date(p.date);
        const sameMonth = d.getMonth() === currentMonth - 1;
        const sameYear = d.getFullYear() === currentYear;

        // Handle January edge case (month === 0)
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const yearCheck = currentMonth === 0 ? currentYear - 1 : currentYear;

        return d.getMonth() === prevMonth && d.getFullYear() === yearCheck;
      });

      const total = lastMonthPayments.reduce((subTotal, p) => {
        const price = Number(p.amount || s.price || 0);
        return subTotal + price;
      }, 0);

      return sum + total;
    }, 0);
  }, [subscriptions]);

  const totalMonthly = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return subscriptions.reduce((sum, s) => {
      if (!Array.isArray(s.payments)) return sum;

      const monthlyPayments = s.payments.filter((p) => {
        const date = new Date(p.date);
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      });

      const total = monthlyPayments.reduce((subSum, p) => subSum + Number(p.amount || 0), 0);

      return sum + total;
    }, 0);
  }, [subscriptions]);

  /* ---------------- Totals (Monthly / Annual) ---------------- */
  const monthlyChange = useMemo(() => {
    if (!previousMonthTotal || previousMonthTotal === 0) return null;
    return ((totalMonthly - previousMonthTotal) / previousMonthTotal) * 100;
  }, [totalMonthly, previousMonthTotal]);

  const totalAnnual = useMemo(() => {
    return totalMonthly * 12;
  }, [totalMonthly]);

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
      await kvSave(nextSubs); // Save to backend
      await saveSubscriptionsLocal(nextSubs); // Save to IndexedDB
    } catch (err) {
      console.error("KV save failed:", err);
    }
  };

  // Inside the component
  const syncNow = async () => {
    if (user?.email && localStorage.getItem("token")) {
      await syncPending(user.email, localStorage.getItem("token"));
      // Optionally reload after syncing
      window.location.reload();
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <TrialBanner />
      {!isOnline() && (
        <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded mb-3 text-center">
          You’re currently offline. Changes will be saved locally and synced later.
        </div>
      )}
      {syncStatus && (
        <div className="text-green-600 text-sm text-center mb-2">
          {syncStatus}
        </div>
      )}

      {!isOnline() && (
        <button
          onClick={syncNow}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Sync Offline Data
        </button>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          {!isOnline() && (
            <p className="mt-2 text-sm text-gray-500">Offline mode: Loading from local storage…</p>
          )}
        </div>
      ) : hasSubscriptions ? (
        <>
          {/* ================= SUMMARY CARDS ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-2 mb-4">

            {/* Monthly Total */}
            <div
              className="
      p-5 rounded-2xl relative
      bg-white/90 dark:bg-black/30
      border border-gray-300/60 dark:border-white/10
      backdrop-blur-xl
      shadow-[0_8px_25px_rgba(0,0,0,0.08)]
      dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
      transition-all
    "
              title={`${t("change_since_last_month") || "Change since last month"}`}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("dashboard_total_monthly")}
              </div>
              <div className="text-2xl font-bold tabular-nums mt-1 text-gray-900 dark:text-white">
                {preferredCurrency} {totalMonthly.toFixed(2)}
              </div>
              {/* Optional percentage badge */}
              {typeof monthlyChange === "number" && (
                <div
                  className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${monthlyChange >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                    }`}
                >
                  {monthlyChange >= 0 ? "+" : ""}
                  {monthlyChange.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Annual Total */}
            <div
              className="
      p-5 rounded-2xl
      bg-white/90 dark:bg-black/30
      border border-gray-300/60 dark:border-white/10
      backdrop-blur-xl
      shadow-[0_8px_25px_rgba(0,0,0,0.08)]
      dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
      transition-all
    "
              title={t("tooltip_annual_estimate") || "Projected cost over 12 months"}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("dashboard_total_annual")}
              </div>
              <div className="text-2xl font-bold tabular-nums mt-1 text-gray-900 dark:text-white">
                {preferredCurrency} {totalAnnual.toFixed(2)}
              </div>
            </div>
          </div>

          {/* ================= END SUMMARY ================= */}

        </>
      ) : (
        <EmptyDashboardState />
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
        <div className="space-y-2 mt-2">
          {sorted.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              item={sub}
              theme={theme}
              currency={preferredCurrency}
              onDelete={(id) =>
                persist(subscriptions.filter((s) => s.id !== id))
              }
              onMarkPaid={(id, date) => {
                console.log("Marking as paid", id, date); // ✅ Add this

                const updated = subscriptions.map((s) => {
                  if (s.id !== id) return s;

                  const payments = Array.isArray(s.payments) ? s.payments : [];

                  // ✅ Skip if same date already exists
                  const alreadyPaid = payments.some(
                    (p) => p.date === date
                  );
                  if (alreadyPaid) return s;

                  return {
                    ...s,
                    payments: [
                      ...payments,
                      {
                        id: crypto.randomUUID(),
                        date,
                        amount: s.price,
                        currency: s.currency || "EUR",
                      },
                    ],
                  };
                });

                persist(updated);
                // showToast("Marked as paid!", "success");

              }}

            />
          ))}
        </div>
      )}
    </div>
  );
}



