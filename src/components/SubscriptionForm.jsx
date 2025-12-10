// src/pages/SubscriptionForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import CurrencySelector from "../components/CurrencySelector";
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import { usePremium } from "../hooks/usePremium";

// Reusable UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams();
  const { t } = useTranslation();
  const premium = usePremium();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [datePaid, setDatePaid] = useState("");
  const [notify, setNotify] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  const advancedFrequencies = [
    "quarterly",
    "semiannual",
    "nine_months",
    "biennial",
    "triennial",
  ];

  // LOAD EXISTING SUBSCRIPTION
  useEffect(() => {
    if (id) {
      const saved = JSON.parse(localStorage.getItem("subscriptions")) || [];
      const existing = saved.find((s) => s.id === Number(id));

      if (existing) {
        setName(existing.name);
        setPrice(existing.price);
        setFrequency(existing.frequency);
        setCategory(existing.category || "other");
        setDatePaid(existing.datePaid || "");
        setNotify(existing.notify !== false);
        setCurrency(existing.currency || "EUR");
      }
    } else {
      const storedCurrency = localStorage.getItem("selected_currency");
      if (storedCurrency) setCurrency(storedCurrency);
    }
  }, [id]);

  function generateRecurringHistory(startDate, price, frequency) {
    const history = [];
    const start = new Date(startDate);
    const today = new Date();
    const date = new Date(start);

    while (date <= today) {
      history.push({
        date: date.toISOString().split("T")[0],
        amount: Number(price),
      });

      switch (frequency) {
        case "monthly":
          date.setMonth(date.getMonth() + 1);
          break;
        case "yearly":
          date.setFullYear(date.getFullYear() + 1);
          break;
        default:
          return history;
      }
    }

    return history;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const saved = JSON.parse(localStorage.getItem("subscriptions")) || [];

    if (!id && !premium.isPremium && saved.length >= 5) {
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

    if (!premium.isPremium && advancedFrequencies.includes(frequency)) {
      navigate("/premium?reason=intervals");
      return;
    }

    let updated;

    if (id) {
      updated = saved.map((s) => {
        if (s.id !== Number(id)) return s;

        const newHistory = Array.isArray(s.history) ? [...s.history] : [];

        if (s.datePaid !== datePaid || s.price !== Number(price)) {
          newHistory.push({
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
          history: newHistory,
        };
      });

      showToast(t("toast_updated"), "success");
    } else {
      updated = [
        ...saved,
        {
          id: Date.now(),
          name,
          price: Number(price),
          frequency,
          category,
          datePaid,
          notify,
          currency,
          history: generateRecurringHistory(datePaid, price, frequency),
        },
      ];

      showToast(t("toast_added"), "success");
    }

    localStorage.setItem("subscriptions", JSON.stringify(updated));
    navigate("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-24">
      <Card>
        <h1 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
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
              placeholder="Netflix, Gym, Adobe..."
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

          {/* CURRENCY SELECTOR */}
          {/* <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form_currency")}
            </label>
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div> */}

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
            <SettingButton
              type="submit"
              variant="primary"
              className="sm:w-auto"
            >
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
