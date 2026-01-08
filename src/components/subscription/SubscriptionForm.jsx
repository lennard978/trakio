import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { usePremium } from "../../hooks/usePremium";
import { useTheme } from "../../hooks/useTheme";

// UI + Sections
import Card from "../ui/Card";
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

// Constants
import { subscriptionCatalog } from "../../data/subscriptionCatalog";
import { PRESET_COLORS, PAYMENT_METHODS } from "./constants";
import DashboardLoading from "../dasboard/DashboardLoading";

export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();
  const { theme } = useTheme();

  const email = user?.email;

  const [methodOpen, setMethodOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useSubscriptionForm({
    id,
    email,
    premium,
    navigate,
    showToast,
    t,
  });

  /* ---------- Suggestions ---------- */

  const suggestions = useMemo(() => {
    if (!form.name.trim()) return [];
    const q = form.name.toLowerCase();
    return subscriptionCatalog
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [form.name]);

  /* ---------- Payment Method ---------- */

  const selectedMethod =
    PAYMENT_METHODS.find((m) => m.value === form.method) || {
      value: "",
      label: "form.select_method", // i18n key (NOT translated here)
      icon: "💳",
      logo: null,
    };

  /* ---------- Preview Gradient ---------- */

  const isDarkMode = theme === "dark";
  const previewGradient = form.color
    ? `linear-gradient(135deg, ${form.color} 0%, rgba(255,255,255,0.12) 100%)`
    : isDarkMode
      ? "linear-gradient(135deg, rgba(40,40,40,0.9), rgba(25,25,25,0.7))"
      : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))";

  const textColorClass = isDarkMode
    ? "text-white dark:text-white"
    : "text-gray-900 dark:text-white";

  /* ---------- Loading ---------- */

  if (form.loading) {
    return (
      <DashboardLoading />
    );
  }

  /* ---------- Render ---------- */

  return (
    <div className="max-w-2xl mx-auto pb-2">
      <motion.div
        key={form.color || "default"}
        initial={{ opacity: 0.6 }}
        animate={{ background: previewGradient, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
        className={`rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 ${textColorClass}`}
        style={{
          background: previewGradient,
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl">
          <Card transparent>
            <h1 className="text-2xl font-bold mb-2 py-4">
              {id ? t("edit_title") : t("add_title")}
            </h1>

            <form
              onSubmit={(e) => {
                setShowSuggestions(false);
                form.handleSubmit(e);
              }}
              className="space-y-5"
            >
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

              <PriceField
                price={form.price}
                setPrice={form.setPrice}
                currency={form.currency}
                t={t}
              />

              <FrequencyField
                frequency={form.frequency}
                setFrequency={form.setFrequency}
                isPremium={premium.isPremium}
                onRequirePremium={() =>
                  navigate("/premium?reason=intervals")
                }
                t={t}
              />

              <CategoryField
                category={form.category}
                setCategory={form.setCategory}
                setGradientIntensity={form.setGradientIntensity}
                t={t}
              />

              <PaymentMethodField
                setMethod={form.setMethod}
                methods={PAYMENT_METHODS}
                selectedMethod={selectedMethod}
                methodOpen={methodOpen}
                setMethodOpen={setMethodOpen}
                t={t}
              />

              <ColorPickerField
                color={form.color}
                setColor={form.setColor}
                presetColors={PRESET_COLORS}
                t={t}
              />

              <DatePaidField
                datePaid={form.datePaid}
                setDatePaid={form.setDatePaid}
                t={t}
              />

              <NotifyField
                notify={form.notify}
                setNotify={form.setNotify}
                t={t}
              />

              <FormActions
                isEdit={Boolean(id)}
                hasUndo={form.hasChanges}
                onSubmit={form.handleSubmit}
                onCancel={() => {
                  setShowSuggestions(false);
                  navigate("/dashboard");
                }}
                onDelete={form.handleDelete}
                onUndo={form.handleUndo}
                t={t}
              />
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
