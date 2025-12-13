import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";

// UI
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // string
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();

  const email = user?.email;

  const [subscriptions, setSubscriptions] = useState([]);

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

  /* ------------------------------------------------------------------
   * Load subscriptions from KV
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!email) return;

    const load = async () => {
      try {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", email }),
        });

        if (!res.ok) throw new Error("Failed to load subscriptions");

        const data = await res.json();
        const list = Array.isArray(data.subscriptions)
          ? data.subscriptions
          : [];

        setSubscriptions(list);

        if (id) {
          const existing = list.find((s) => String(s.id) === String(id));
          if (!existing) return;

          setName(existing.name);
          setPrice(existing.price);
          setFrequency(existing.frequency);
          setCategory(existing.category || "other");
          setDatePaid(existing.datePaid || "");
          setNotify(existing.notify !== false);
          setCurrency(existing.currency || "EUR");
        } else {
          const savedCurrency = localStorage.getItem("selected_currency");
          if (savedCurrency) setCurrency(savedCurrency);
        }
      } catch (err) {
        console.error("SubscriptionForm load error:", err);
        showToast("Failed to load subscription data", "error");
      }
    };

    load();
  }, [email, id, showToast]);

  /* ------------------------------------------------------------------
   * Premium restrictions
   * ------------------------------------------------------------------ */
  const limitReached =
    !id && !premium.isPremium && subscriptions.length >= 5;

  const requiresPremiumInterval =
    !premium.isPremium && advancedFrequencies.includes(frequency);

  /* ------------------------------------------------------------------
   * Save helper
   * ------------------------------------------------------------------ */
  const saveToKV = async (updated) => {
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        email,
        subscriptions: updated,
      }),
    });
  };

  /* ------------------------------------------------------------------
   * Submit handler
   * ------------------------------------------------------------------ */
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

    let updated;

    if (id) {
      // ✏️ Edit
      updated = subscriptions.map((s) => {
        if (String(s.id) !== String(id)) return s;

        const history = Array.isArray(s.history) ? [...s.history] : [];

        if (s.datePaid && s.datePaid !== datePaid) {
          history.push(s.datePaid);
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
      // ➕ New
      updated = [
        ...subscriptions,
        {
          id: crypto.randomUUID(),
          name,
          price: Number(price),
          frequency,
          category,
          datePaid,
          notify,
          currency,
          history: [],
        },
      ];

      showToast(t("toast_added"), "success");
    }

    try {
      await saveToKV(updated);
      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save subscription", "error");
    }
  };

  /* ------------------------------------------------------------------ */

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
      <Card>
        <h1 className="text-2xl font-bold mb-2 py-4">
          {id ? t("edit_title") : t("add_title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("form_name")}
            className="w-full px-3 py-2 rounded-xl border"
          />

          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border"
          />

          <FrequencySelector
            value={frequency}
            onChange={setFrequency}
            isPremium={premium.isPremium}
            onRequirePremium={() => navigate("/premium?reason=intervals")}
          />

          <CategorySelector value={category} onChange={setCategory} />

          <input
            type="date"
            value={datePaid}
            onChange={(e) => setDatePaid(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
            {t("settings_notifications_info")}
          </label>

          <div className="flex gap-2">
            <SettingButton type="submit" variant="primary">
              {id ? t("form_save") : t("add_subscription")}
            </SettingButton>

            <SettingButton
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
