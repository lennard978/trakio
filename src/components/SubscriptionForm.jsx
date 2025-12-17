import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";
import { useCurrency } from "../context/CurrencyContext";

// UI
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import CurrencySelector from "../components/CurrencySelector";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import PaymentMethodIcon from "./icons/PaymentMethodIcons";
import { fetchRates, convert } from "../utils/fx";

/* -------------------- Utility -------------------- */
function normalizeDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

const MONTHLY_FACTOR = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  nine_months: 1 / 9,
  yearly: 1 / 12,
  biennial: 1 / 24,
  triennial: 1 / 36,
};

function uniqDates(list) {
  const out = [];
  const seen = new Set();
  for (const d of list) {
    const nd = normalizeDateString(d);
    if (!nd || seen.has(nd)) continue;
    seen.add(nd);
    out.push(nd);
  }
  return out;
}

/* -------------------- Component -------------------- */
export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();
  const { currency: mainCurrency } = useCurrency();

  const email = user?.email;
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [datePaid, setDatePaid] = useState("");
  const [notify, setNotify] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [method, setMethod] = useState("");

  const [rates, setRates] = useState(null);
  const [convertedInput, setConvertedInput] = useState(null);
  const [convertedMonthly, setConvertedMonthly] = useState(null);

  const advancedFrequencies = useMemo(
    () => ["quarterly", "semiannual", "nine_months", "biennial", "triennial"],
    []
  );

  const limitReached = !id && !premium.isPremium && subscriptions.length >= 5;
  const requiresPremiumInterval = !premium.isPremium && advancedFrequencies.includes(frequency);
  const token = localStorage.getItem("token");

  /* ------------------ Load Subscriptions ------------------ */
  const kvGet = async () => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", email }),
    });
    const data = await res.json();
    return Array.isArray(data.subscriptions) ? data.subscriptions : [];
  };

  const kvSave = async (updated) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "save", email, subscriptions: updated }),
    });

    if (!res.ok) {
      let msg = "Failed to save subscriptions";
      try {
        const data = await res.json();
        msg = data?.error || msg;
      } catch { }
      throw new Error(msg);
    }
  };

  /* ------------------ Load Data ------------------ */
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const list = await kvGet();
        if (cancelled) return;

        setSubscriptions(list);

        if (id) {
          const existing = list.find((s) => String(s.id) === String(id));
          if (!existing) {
            showToast("Subscription not found", "error");
            navigate("/dashboard");
            return;
          }

          setName(existing.name || "");
          setPrice(String(existing.price || ""));
          setFrequency(existing.frequency || "monthly");
          setCategory(existing.category || "other");
          setDatePaid(existing.datePaid || "");
          setNotify(existing.notify !== false);
          setCurrency(existing.currency || "EUR");
          setMethod(existing.method || "");
        }
      } catch (err) {
        console.error("SubscriptionForm load error:", err);
        showToast("Failed to load subscription data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [email, id, navigate, showToast]);

  useEffect(() => {
    fetchRates("EUR").then((res) => res && setRates(res));
  }, []);

  /* ------------------ Currency Conversion ------------------ */
  useEffect(() => {
    if (convert && rates && price && currency && mainCurrency) {
      const priceNum = Number(price);
      if (priceNum > 0) {
        const inputConverted = convert(priceNum, currency, mainCurrency, rates);
        setConvertedInput(inputConverted.toFixed(2));

        const monthlyVal = priceNum * (MONTHLY_FACTOR[frequency] ?? 1);
        const monthlyConverted = convert(monthlyVal, currency, mainCurrency, rates);
        setConvertedMonthly(monthlyConverted.toFixed(2));
      } else {
        setConvertedInput(null);
        setConvertedMonthly(null);
      }
    }
  }, [price, currency, mainCurrency, rates, frequency]);

  const monthlyPreview = useMemo(() => {
    const p = Number(price);
    if (!p || p <= 0) return null;
    const factor = MONTHLY_FACTOR[frequency] ?? 1;
    const value = p * factor;
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [price, frequency]);

  /* ------------------ Submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return showToast("Not authenticated", "error");
    if (limitReached) return navigate("/premium?reason=limit");
    if (!name.trim()) return showToast(t("error_required"), "error");

    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      return showToast(t("error_price_invalid"), "error");
    }

    if (!datePaid) return showToast(t("error_paid_date_required"), "error");
    if (requiresPremiumInterval) return navigate("/premium?reason=intervals");

    const paidRaw = normalizeDateString(datePaid);
    if (!paidRaw) return showToast(t("error_paid_date_required"), "error");

    const today = normalizeDateString(new Date());
    const paid = paidRaw > today ? today : paidRaw;

    try {
      let updated;
      if (id) {
        updated = subscriptions.map((s) => {
          if (String(s.id) !== String(id)) return s;
          const prevPaid = normalizeDateString(s.datePaid);
          const nextHistory = uniqDates([
            ...(Array.isArray(s.history) ? s.history : []),
            ...(prevPaid && prevPaid !== paid ? [prevPaid] : []),
          ]);

          return {
            ...s,
            name: name.trim(),
            price: priceNum,
            frequency,
            category,
            datePaid: paid,
            notify,
            currency,
            method: method.trim(),
            history: nextHistory,
          };
        });
        showToast(t("toast_updated"), "success");
      } else {
        updated = [
          ...subscriptions,
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            price: priceNum,
            frequency,
            category,
            datePaid: paid,
            notify,
            currency,
            method: method.trim(),
            history: [],
          },
        ];
        showToast(t("toast_added"), "success");
      }

      await kvSave(updated);
      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      showToast(err.message || "Failed to save subscription", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
        <Card>
          <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
            Loading…
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------ JSX ------------------ */
  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
      <Card>
        <h1 className="text-2xl font-bold mb-2 py-4 text-gray-900 dark:text-white">
          {id ? t("edit_title") : t("add_title")}
        </h1>

        {/* {monthlyPreview !== null && (
          <div className="text-center text-sm text-gray-500 mb-1">
            ≈ {currency} {monthlyPreview.toFixed(2)} / {t("monthly")}
          </div>
        )}

        {convertedMonthly && (
          <div className="text-center text-sm text-gray-500 mb-1">
            ≈ {mainCurrency} {convertedMonthly} / {t("monthly")}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("placeholder_examples")}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            />
          </div>

          {/* Price */}
          <div>
            <label className=" mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_price")} ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
              />
              {/* {convertedInput && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ≈ {mainCurrency} {convertedInput}
                </span>
              )} */}
            </div>
          </div>

          {/* Currency */}
          {/* <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Currency
            </label>
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div> */}

          {/* Frequency */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_frequency")}
            </label>
            <FrequencySelector
              value={frequency}
              onChange={setFrequency}
              isPremium={premium.isPremium}
              onRequirePremium={() => navigate("/premium?reason=intervals")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_category")}
            </label>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method
            </label>
            <div className="mb-2">
              <PaymentMethodIcon method={method} />
            </div>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="e.g. Visa, PayPal, Bank Transfer"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            />
          </div>

          {/* Date Paid */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("label_select_paid_date")}
            </label>
            <input
              type="date"
              value={datePaid}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            />
          </div>

          {/* Notify */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings_notifications_info")}
            </label>
          </div>

          {/* Submit / Cancel */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <SettingButton type="submit" variant="primary">
              {id ? t("form_save") : t("add_subscription")}
            </SettingButton>
            <SettingButton
              type="button"
              variant="neutral"
              onClick={() => navigate("/dashboard")}
            >
              {t("button_cancel")}
            </SettingButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
