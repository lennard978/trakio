// src/pages/SubscriptionForm.jsx (or wherever it lives)

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import CurrencySelector from "../components/CurrencySelector";
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import { usePremium } from "../hooks/usePremium";

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

  // LOAD EXISTING SUB
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

    // Safety check (UI already prevents it)
    if (!premium.isPremium && advancedFrequencies.includes(frequency)) {
      navigate("/premium?reason=intervals");
      return;
    }

    let updated;
    if (id) {
      updated = saved.map((s) =>
        s.id === Number(id)
          ? {
            ...s,
            name,
            price: Number(price),
            frequency,
            category,
            datePaid,
            notify,
            currency,
          }
          : s
      );
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
        },
      ];
      showToast(t("toast_added"), "success");
    }

    localStorage.setItem("subscriptions", JSON.stringify(updated));
    navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-2 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h1 className="text-xl font-semibold mb-6">
        {id ? t("edit_title") : t("add_title")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NAME */}
        <div>
          <label className="block mb-1 text-sm">{t("form_name")}</label>
          <div className="form-field">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Gym, Adobe..."
            />
          </div>
        </div>

        {/* PRICE */}
        <div>
          <label className="block mb-1 text-sm">
            {t("form_price")} ({currency})
          </label>
          <div className="form-field">
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* CURRENCY */}
        <div>
          <label className="block mb-1 text-sm">{t("form_currency")}</label>
          {premium.isPremium ? (
            <CurrencySelector value={currency} onChange={setCurrency} />
          ) : (
            <div
              className="form-field cursor-pointer"
              onClick={() => navigate("/premium?reason=currency")}
            >
              <span>EUR — {t("premium_locked_currency")}</span>
              <span className="form-arrow">▾</span>
            </div>
          )}
        </div>

        {/* FREQUENCY */}
        <div>
          <label className="block mb-1 text-sm">{t("form_frequency")}</label>
          <FrequencySelector
            value={frequency}
            onChange={setFrequency}
            isPremium={premium.isPremium}
            onRequirePremium={() => navigate("/premium?reason=intervals")}
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block mb-1 text-sm">{t("form_category")}</label>
          <CategorySelector value={category} onChange={setCategory} />
        </div>

        {/* DATE PAID */}
        <div>
          <label className="block mb-1 text-sm">
            {t("label_select_paid_date")}
          </label>
          <div className="form-field">
            <input
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
            />
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          <label className="text-sm">{t("settings_notifications_info")}</label>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition active:scale-95"
          >
            {id ? t("form_save") : t("add_subscription")}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition active:scale-95"
          >
            {t("button_cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
