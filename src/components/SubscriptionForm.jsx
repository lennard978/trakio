// src/pages/SubscriptionForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import CurrencySelector from "../components/CurrencySelector";

import { usePremium } from "../hooks/usePremium";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const premium = usePremium();

  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [currency, setCurrency] = useState("EUR");
  const [datePaid, setDatePaid] = useState("");

  const isEdit = Boolean(id);

  /* ------------------------------------------------------------------ */
  /* Load existing subscription (edit mode)                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isEdit) return;

    const stored = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    const existing = stored.find((s) => s.id === id);
    if (!existing) return;

    setName(existing.name || "");
    setPrice(String(existing.price ?? ""));
    setFrequency(existing.frequency || "monthly");
    setCategory(existing.category || "other");
    setCurrency(existing.currency || "EUR");
    setDatePaid(existing.datePaid || "");
  }, [id, isEdit]);

  /* ------------------------------------------------------------------ */
  /* Save handler                                                        */
  /* ------------------------------------------------------------------ */
  const handleSave = () => {
    if (!name || !price) {
      alert(t("form_required_fields"));
      return;
    }

    const stored = JSON.parse(localStorage.getItem("subscriptions") || "[]");

    if (isEdit) {
      const updated = stored.map((s) => {
        if (s.id !== id) return s;

        return {
          ...s,
          name: name.trim(),
          price: Number(price),
          frequency,
          category,
          currency,
          datePaid: datePaid || null,
          // IMPORTANT:
          // history is NOT touched here
          // only "Mark as Paid" adds to history
        };
      });

      localStorage.setItem("subscriptions", JSON.stringify(updated));
    } else {
      const newSubscription = {
        id: crypto.randomUUID(),
        name: name.trim(),
        price: Number(price),
        frequency,
        category,
        currency,
        datePaid: datePaid || null,
        history: [], // ← always start empty
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "subscriptions",
        JSON.stringify([...stored, newSubscription])
      );
    }

    navigate("/dashboard");
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-xl mx-auto mt-4 px-3">
      <Card>
        <h1 className="text-xl font-bold mb-4 text-center">
          {isEdit ? t("edit_subscription") : t("add_subscription")}
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("subscription_name")}
            className="w-full p-3 rounded-xl border dark:border-gray-700
                       bg-white dark:bg-black/40"
          />

          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("price")}
            className="w-full p-3 rounded-xl border dark:border-gray-700
                       bg-white dark:bg-black/40"
          />

          <CurrencySelector value={currency} onChange={setCurrency} />

          <FrequencySelector value={frequency} onChange={setFrequency} />

          <CategorySelector value={category} onChange={setCategory} />

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("label_last_paid")}
            </label>
            <input
              type="date"
              value={datePaid || ""}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full p-3 rounded-xl border dark:border-gray-700
                         bg-white dark:bg-black/40"
            />
          </div>

          {!premium.isPremium && (
            <div className="text-xs text-center text-gray-500 mt-2">
              {t("premium_currency_hint")}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <SettingButton onClick={() => navigate("/dashboard")} variant="secondary">
            {t("button_cancel")}
          </SettingButton>

          <SettingButton onClick={handleSave} variant="primary">
            {t("button_save")}
          </SettingButton>
        </div>
      </Card>
    </div>
  );
}
