import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";

import PremiumFeatureRow from "../components/PremiumFeatureRow";
import { useTranslation } from "react-i18next";

export default function Premium() {
  const premium = usePremium();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const { t } = useTranslation();
  /* -------------------- Already Premium -------------------- */
  if (premium.isPremium) {
    return (
      <div className="max-w-xl mx-auto mt-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">
          {t("premium_already_title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("premium_already_message")}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow"
        >
          {t("premium_go_to_dashboard")}
        </button>
      </div>
    );
  }

  /* -------------------- Upgrade Page -------------------- */
  return (
    <div className="max-w-xl mx-auto mt-8 px-4 space-y-8">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          {t("premium_subscription")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("premium_subtitle")}
        </p>
      </div>

      {/* VALUE PROPS */}
      <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>{t("premium_benefit_1")}</span>
        </div>
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>{t("premium_benefit_2")}</span>
        </div>
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>{t("premium_benefit_3")}</span>
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border dark:border-gray-800 p-5 space-y-3">
        <PremiumFeatureRow title={t("premium_feature_1")} free premium />
        <PremiumFeatureRow title={t("premium_feature_2")} premium />
        <PremiumFeatureRow title={t("premium_feature_3")} premium />
        <PremiumFeatureRow title={t("premium_feature_4")} premium />
        <PremiumFeatureRow title={t("premium_feature_5")} premium />
        <PremiumFeatureRow title={t("premium_feature_6")} premium />
      </div>


      {/* LEGAL CONSENT – PREMIUM STYLE */}
      <div className="
  rounded-2xl border
  bg-gray-50 dark:bg-gray-800/60
  border-gray-200 dark:border-gray-700
  p-4 space-y-3
">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {t("premium_checkout_title")}
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {t("premium_checkout_text")}
          <a
            href="/agb"
            target="_blank"
            className="underline font-medium"
          >
            {t("premium_checkout_terms") || "Terms of Service"}
          </a>{" "}
          and{" "}
          <a
            href="/datenschutz"
            target="_blank"
            className="underline font-medium"
          >
            {t("premium_checkout_privacy") || "Privacy Policy"}
          </a>.
          {t("premium_checkout_consent")}
        </p>

        <label className="flex flex-col items-start gap-3 cursor-pointer">
          <div className="flex flex-row gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 accent-orange-600"
            />
            {!accepted && (
              <p className="text-xs dark:text-orange-400 mt-2">
                {t("premium_accept") || "Please accept the terms to start your free trial."}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {t("premium_checkout_checkbox")}
          </span>
        </label>

        <div className="text-[11px] text-gray-500 dark:text-gray-400">
          {t("premium_checkout_footer")}
        </div>
      </div>

      {/* PRICING */}
      <div className="grid gap-4">
        {/* YEARLY */}
        <div className="
  relative
  rounded-2xl p-6 text-center
  bg-blue-500/5 dark:bg-blue-500/10
  border-2 border-orange-500
  dark:border-orange-400 
  shadow-xl dark:shadow-orange-500/10 hover:animate-[fadeIn_250ms_ease-out]">
          <span className="
    absolute -top-4 left-1/2 -translate-x-1/2
    bg-orange-600 text-white
    text-xs font-semibold
    px-4 py-1 rounded-full
    shadow
  ">            {t("premium_best_value")}
          </span>

          <h3 className="font-semibold text-lg mt-2 text-orange-300">{t("premium_yearly_title")}</h3>
          <div className="text-4xl font-bold mb-2 text-orange-400">{t("premium_yearly_price")}</div>
          <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">
            {t("premium_yearly_note")}
          </p>

          <button
            disabled={!accepted || premium.loading || !premium.loaded}
            onClick={() => premium.startCheckout("yearly")}
            className={`
    w-full py-4 rounded-xl font-semibold text-lg
    transition-all duration-150 ease-out
    ${accepted
                ? "bg-orange-400 dark:bg-orange-500 hover:scale-[1.015] hover:shadow-lg hover:shadow-orange-500/30 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"}
    `}        >
            {t("premium_yearly_button")}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            {t("premium_trial_note")}
          </p>
        </div>
        {/* MONTHLY */}
        <div className="
  border border-gray-700
  rounded-2xl
  p-5
  text-center
  opacity-90
">            <h3 className="font-medium mb-1">
            {t("premium_monthly_title")}</h3>
          <div className="text-2xl font-semibold mb-1">
            {t("premium_monthly_price")}</div>
          <p className="text-sm text-gray-500 mb-4">
            {t("premium_monthly_note")}
          </p>

          <button
            disabled={!accepted || premium.loading || !premium.loaded}
            onClick={() => premium.startCheckout("monthly")}
            className={`
      w-full py-3 rounded-xl font-medium
      transition
      ${accepted
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"}
    `}         >
            {t("premium_monthly_button")}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            {t("premium_trial_note")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t("premium_trial_auto_renew")}
          </p>
        </div>
      </div>

      {/* TRUST */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>• {t("premium_trust_1")}</div>
        <div>• {t("premium_trust_2")}</div>
        <div>• {t("premium_trust_3")}</div>
        <div>• {t("premium_trust_4")}</div>
      </div>
    </div>
  );
}
