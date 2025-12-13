// src/components/SubscriptionForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";

// UI / Selectors
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

function normalizeDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
}

function uniqDates(list) {
  const out = [];
  const seen = new Set();
  for (const d of list) {
    const nd = normalizeDateString(d);
    if (!nd) continue;
    if (seen.has(nd)) continue;
    seen.add(nd);
    out.push(nd);
  }
  return out;
}

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // string
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();

  const email = user?.email;

  // KV-loaded subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [datePaid, setDatePaid] = useState("");
  const [notify, setNotify] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  const advancedFrequencies = useMemo(
    () => ["quarterly", "semiannual", "nine_months", "biennial", "triennial"],
    []
  );

  // Premium restrictions
  const limitReached = !id && !premium.isPremium && subscriptions.length >= 5;
  const requiresPremiumInterval =
    !premium.isPremium && advancedFrequencies.includes(frequency);

  // KV helpers
  const kvGet = async () => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get", email }),
    });
    if (!res.ok) throw new Error("Failed to load subscriptions");
    const data = await res.json();
    return Array.isArray(data.subscriptions) ? data.subscriptions : [];
  };

  const kvSave = async (updated) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        email,
        subscriptions: updated,
      }),
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

  // Load subscriptions from KV, then hydrate edit form if needed
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
          setPrice(
            typeof existing.price === "number" ? String(existing.price) : String(existing.price || "")
          );
          setFrequency(existing.frequency || "monthly");
          setCategory(existing.category || "other");
          setDatePaid(existing.datePaid || "");
          setNotify(existing.notify !== false);
          setCurrency(existing.currency || "EUR");
        } else {
          // New subscription: default currency from navbar setting (localStorage is fine for preferences)
          const savedCurrency = localStorage.getItem("selected_currency");
          if (savedCurrency) setCurrency(savedCurrency);
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Not authenticated", "error");
      return;
    }

    if (limitReached) {
      navigate("/premium?reason=limit");
      return;
    }

    if (!name.trim()) {
      showToast(t("error_required"), "error");
      return;
    }

    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      showToast(t("error_price_invalid"), "error");
      return;
    }

    if (!datePaid) {
      showToast(t("error_paid_date_required"), "error");
      return;
    }

    if (requiresPremiumInterval) {
      navigate("/premium?reason=intervals");
      return;
    }

    const paid = normalizeDateString(datePaid);
    if (!paid) {
      showToast(t("error_paid_date_required"), "error");
      return;
    }

    try {
      let updated;

      if (id) {
        // ✏️ Edit existing subscription
        updated = subscriptions.map((s) => {
          if (String(s.id) !== String(id)) return s;

          const prevPaid = normalizeDateString(s.datePaid);
          const nextHistory = uniqDates([
            ...(Array.isArray(s.history) ? s.history : []),
            // If datePaid changed, push the previous datePaid into history
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
            history: nextHistory, // ✅ always string[]
          };
        });

        showToast(t("toast_updated"), "success");
      } else {
        // ➕ New subscription
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
            history: [], // ✅ string[] (previous paid dates only)
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

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
      <Card>
        <h1 className="text-2xl font-bold mb-2 py-4 text-gray-900 dark:text-white">
          {id ? t("edit_title") : t("add_title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
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

          {/* PRICE */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_price")} ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            />
          </div>

          {/* FREQUENCY */}
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

          {/* CATEGORY */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_category")}
            </label>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          {/* DATE PAID */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("label_select_paid_date")}
            </label>
            <input
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            />
          </div>

          {/* NOTIFY */}
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

          {/* ACTIONS */}
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
