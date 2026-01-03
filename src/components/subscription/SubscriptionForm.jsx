import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { usePremium } from "../../hooks/usePremium";

// UI shell
import Card from "../ui/Card";

// Sections
import NameField from "./sections/NameField";
import PriceField from "./sections/PriceField";
import FrequencyField from "./sections/FrequencyField";
import CategoryField from "./sections/CategoryField";
import PaymentMethodField from "./sections/PaymentMethodField";
import ColorPickerField from "./sections/ColorPickerField";
import DatePaidField from "./sections/DatePaidField";
import NotifyField from "./sections/NotifyField";
import FormActions from "./sections/FormActions";

// Hook
import { useSubscriptionForm } from "./hooks/useSubscriptionForm";

// Data / constants
import { subscriptionCatalog } from "../../data/subscriptionCatalog";
import {
  PRESET_COLORS,
  PAYMENT_METHODS
} from "./constants";

/* -------------------- Component -------------------- */

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();

  const email = user?.email;

  /* -------------------- Local UI state -------------------- */

  const [methodOpen, setMethodOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* -------------------- Form logic hook -------------------- */

  const form = useSubscriptionForm({
    id,
    email,
    user,
    premium,
    navigate,
    showToast,
    t
  });

  /* -------------------- Suggestions -------------------- */

  const suggestions = useMemo(() => {
    if (!form.name.trim()) return [];
    const q = form.name.toLowerCase();
    return subscriptionCatalog
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [form.name]);

  /* -------------------- Payment method label -------------------- */

  const selectedMethod =
    PAYMENT_METHODS.find((m) => m.value === form.method) || {
      label: t("form.select_method"),
      icon: "💳"
    };

  /* -------------------- Loading -------------------- */

  if (form.loading) {
    return (
      <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
        <Card>
          <div className="py-8 text-center text-sm">
            {t("loading")}
          </div>
        </Card>
      </div>
    );
  }

  /* -------------------- JSX -------------------- */

  return (
    <div className="max-w-2xl mx-auto pb-2">
      <Card>
        <h1 className="text-2xl font-bold mb-2 py-4 text-gray-900 dark:text-white">
          {id ? t("edit_title") : t("add_title")}
        </h1>

        <form onSubmit={form.handleSubmit} className="space-y-5">
          {/* Name */}
          <NameField
            name={form.name}
            setName={form.setName}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            setIcon={form.setIcon}
            setCategory={form.setCategory}
            t={t}
          />

          {/* Price */}
          <PriceField
            price={form.price}
            setPrice={form.setPrice}
            currency={form.currency}
            t={t}
          />

          {/* Frequency */}
          <FrequencyField
            frequency={form.frequency}
            setFrequency={form.setFrequency}
            isPremium={premium.isPremium}
            onRequirePremium={() =>
              navigate("/premium?reason=intervals")
            }
            t={t}
          />

          {/* Category */}
          <CategoryField
            category={form.category}
            setCategory={form.setCategory}
            t={t}
          />

          {/* Payment Method */}
          <PaymentMethodField
            method={form.method}
            setMethod={form.setMethod}
            methods={PAYMENT_METHODS}
            selectedMethod={selectedMethod}
            methodOpen={methodOpen}
            setMethodOpen={setMethodOpen}
            t={t}
          />

          {/* Color */}
          <ColorPickerField
            color={form.color}
            setColor={form.setColor}
            presetColors={PRESET_COLORS}
            t={t}
          />

          {/* Date Paid */}
          <DatePaidField
            datePaid={form.datePaid}
            setDatePaid={form.setDatePaid}
            t={t}
          />

          {/* Notify */}
          <NotifyField
            notify={form.notify}
            setNotify={form.setNotify}
            t={t}
          />

          {/* Actions */}
          <FormActions
            isEdit={Boolean(id)}
            hasUndo={form.hasChanges}
            onSubmit={form.handleSubmit}
            onCancel={() => navigate("/dashboard")}
            onDelete={form.handleDelete}
            onUndo={form.handleUndo}
            t={t}
          />
        </form>
      </Card>
    </div>
  );
}
