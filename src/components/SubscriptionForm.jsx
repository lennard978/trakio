// src/pages/SubscriptionForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import { usePremium } from "../hooks/usePremium";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const premium = usePremium();

  /** ------------------------------------------------------------------
   * Local state
   * ------------------------------------------------------------------ */
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

  /** ------------------------------------------------------------------
   * Load subscription if editing
   * ------------------------------------------------------------------ */
  useEffect(() => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    } catch {
      stored = [];
    }

    if (!id) {
      const defaultCurrency = localStorage.getItem("selected_currency");
      if (defaultCurrency) setCurrency(defaultCurrency);
      return;
    }

    const existing = stored.find((s) => s.id === Number(id));
    if (!existing) return;

    setName(existing.name);
    setPrice(existing.price);
    setFrequency(existing.frequency);
    setCategory(existing.category || "other");
    setDatePaid(existing.datePaid || "");
    setNotify(existing.notify !== false);
    setCurrency(existing.currency || "EUR");
  }, [id]);

  /** ------------------------------------------------------------------
   * Helper: Recurring history generation
   * ------------------------------------------------------------------ */
  function generateHistory(startDate, price, frequency) {
    const history = [];
    const today = new Date();
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return history;

    const date = new Date(start);

    while (date <= today) {
      history.push({
        date: date.toISOString().split("T")[0],
        amount: Number(price),
      });

      if (frequency === "monthly") {
        date.setMonth(date.getMonth() + 1);
      } else if (frequency === "yearly") {
        date.setFullYear(date.getFullYear() + 1);
      } else {
        break;
      }
    }

    return history;
  }

  /** ------------------------------------------------------------------
   * Validation helpers
   * ------------------------------------------------------------------ */
  const savedSubscriptions = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const limitReached =
    !id && !premium.isPremium && savedSubscriptions.length >= 5;

  const requiresPremiumInterval =
    !premium.isPremium && advancedFrequencies.includes(frequency);

  /** ------------------------------------------------------------------
   * Core submit handler
   * ------------------------------------------------------------------ */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (limitReached) {
      navigate("/premium?reason=limit");
      return;
    }

    if (!name.trim()) {
      showToast(t("error_required"), "error");
      return;
    }

    if (!price || Number(price) <= 0) {
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

    let newSubscriptions;

    if (id) {
      // Editing
      newSubscriptions = savedSubscriptions.map((s) => {
        if (s.id !== Number(id)) return s;

        const history = Array.isArray(s.history) ? [...s.history] : [];

        if (s.datePaid !== datePaid || s.price !== Number(price)) {
          history.push({
            date: datePaid,
            amount: Number(price),
          });
        }

        return {
          ...s,
          name,
          price: Number(price),
          frequency,
          category,
          datePaid,
          notify,
          currency,
          history,
        };
      });

      showToast(t("toast_updated"), "success");
    } else {
      // New subscription
      newSubscriptions = [
        ...savedSubscriptions,
        {
          id: Date.now(),
          name,
          price: Number(price),
          frequency,
          category,
          datePaid,
          notify,
          currency,
          history: generateHistory(datePaid, price, frequency),
        },
      ];

      showToast(t("toast_added"), "success");
    }

    localStorage.setItem("subscriptions", JSON.stringify(newSubscriptions));
    navigate("/dashboard");
  };

  /** ------------------------------------------------------------------
   * UI
   * ------------------------------------------------------------------ */
  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
      <Card>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white py-4">
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
              className="
                w-full px-3 py-2 rounded-xl
                bg-white/80 dark:bg-gray-900/60
                border border-gray-300/70 dark:border-gray-600
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition
              "
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
              className="
                w-full px-3 py-2 rounded-xl
                bg-white/80 dark:bg-gray-900/60
                border border-gray-300/70 dark:border-gray-600
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition
              "
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
              className="
                w-full px-3 py-2 rounded-xl
                bg-white/80 dark:bg-gray-900/60
                border border-gray-300/70 dark:border-gray-600
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition
              "
            />
          </div>

          {/* NOTIFICATIONS */}
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

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <SettingButton type="submit" variant="primary" className="sm:w-auto">
              {id ? t("form_save") : t("add_subscription")}
            </SettingButton>

            <SettingButton
              variant="neutral"
              className="sm:w-auto"
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
