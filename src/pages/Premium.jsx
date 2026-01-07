import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import PremiumFeatureRow from "../components/PremiumFeatureRow";

export default function Premium() {
  const premium = usePremium();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  /* -------------------- Already Premium -------------------- */
  if (premium.isPremium) {
    return (
      <main className="max-w-xl mx-auto mt-12 px-4">
        <Card className="text-center space-y-4 p-6">
          <h1 className="text-2xl font-bold">
            {t("premium_already_title")}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("premium_already_message")}
          </p>

          <SettingButton
            variant="primary"
            onClick={() => navigate("/dashboard")}
            className="w-full"
          >
            {t("premium_go_to_dashboard")}
          </SettingButton>
        </Card>
      </main>
    );
  }

  /* -------------------- Upgrade Page -------------------- */
  return (
    <main className="max-w-xl mx-auto mt-8 px-4 space-y-8">
      {/* HEADER */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {t("premium_subscription")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t("premium_subtitle")}
        </p>
      </header>

      {/* VALUE PROPS */}
      <ul className="grid gap-3 text-sm text-gray-700 dark:text-gray-300">
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex gap-2 items-start">
            <span aria-hidden>✔️</span>
            <span>{t(`premium_benefit_${i}`)}</span>
          </li>
        ))}
      </ul>

      {/* FEATURES */}
      <Card className="space-y-3">
        <PremiumFeatureRow title={t("premium_feature_1")} free premium />
        <PremiumFeatureRow title={t("premium_feature_2")} premium />
        <PremiumFeatureRow title={t("premium_feature_3")} premium />
        <PremiumFeatureRow title={t("premium_feature_4")} premium />
        <PremiumFeatureRow title={t("premium_feature_5")} premium />
        <PremiumFeatureRow title={t("premium_feature_6")} premium />
      </Card>

      {/* LEGAL CONSENT */}
      <fieldset
        className="rounded-2xl border bg-gray-50 dark:bg-gray-800/60
                   border-gray-200 dark:border-gray-700 p-4 space-y-3"
      >
        <legend className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {t("premium_checkout_title")}
        </legend>

        <p
          id="premium-consent-text"
          className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          {t("premium_checkout_text")}
          <a href="/agb" target="_blank" className="underline font-medium">
            {t("premium_checkout_terms")}
          </a>{" "}
          {t("and")}{" "}
          <a href="/datenschutz" target="_blank" className="underline font-medium">
            {t("premium_checkout_privacy")}
          </a>.
          {t("premium_checkout_consent")}
        </p>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            aria-describedby="premium-consent-text"
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-orange-600"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {t("premium_checkout_checkbox")}
          </span>
        </label>

        {!accepted && (
          <p className="text-xs text-orange-500">
            {t("premium_accept")}
          </p>
        )}

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {t("premium_checkout_footer")}
        </p>
      </fieldset>

      {/* PRICING */}
      <section className="grid gap-4">
        {/* YEARLY */}
        <Card className="relative text-center border-2 border-orange-500 dark:border-orange-400">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2
                           bg-orange-600 text-white text-xs font-semibold
                           px-4 py-1 rounded-full">
            {t("premium_best_value")}
          </span>

          <h3 className="font-semibold text-lg mt-4">
            {t("premium_yearly_title")}
          </h3>

          <div className="text-4xl font-bold text-orange-400">
            {t("premium_yearly_price")}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {t("premium_yearly_note")}
          </p>

          <SettingButton
            variant="primary"
            disabled={!accepted || premium.loading || !premium.loaded}
            onClick={() => premium.startCheckout("yearly")}
            className="w-full"
          >
            {t("premium_yearly_button")}
          </SettingButton>

          <p className="text-xs text-gray-400 mt-3">
            {t("premium_trial_note")}
          </p>
        </Card>

        {/* MONTHLY */}
        <Card className="text-center opacity-90">
          <h3 className="font-medium">
            {t("premium_monthly_title")}
          </h3>

          <div className="text-2xl font-semibold">
            {t("premium_monthly_price")}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {t("premium_monthly_note")}
          </p>

          <SettingButton
            variant="neutral"
            disabled={!accepted || premium.loading || !premium.loaded}
            onClick={() => premium.startCheckout("monthly")}
            className="w-full"
          >
            {t("premium_monthly_button")}
          </SettingButton>

          <p className="text-xs text-gray-500 mt-2">
            {t("premium_trial_note")}
          </p>

          <p className="text-xs text-gray-500">
            {t("premium_trial_auto_renew")}
          </p>
        </Card>
      </section>

      {/* TRUST */}
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>• {t(`premium_trust_${i}`)}</div>
        ))}
      </footer>
    </main>
  );
}
