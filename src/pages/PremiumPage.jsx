import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useLocation, useNavigate } from "react-router-dom";
import { usePremiumContext } from "../context/PremiumContext";
import { useAuth } from "../hooks/useAuth";

export default function PremiumPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const premium = usePremiumContext();
  const { user } = useAuth();

  const reason = new URLSearchParams(location.search).get("reason");

  const trialActive = premium.trialEnds !== null;
  const isPaidPremium = premium.isPremium && !trialActive;

  // ------------------------------------------------------------------
  // SAFETY: if user not logged in → redirect to login first
  // ------------------------------------------------------------------
  const requireLogin = () => {
    if (!user?.email) {
      alert("Please log in first.");
      navigate("/login");
      return false;
    }
    return true;
  };

  // ------------------------------------------------------------------
  // Stripe checkout
  // ------------------------------------------------------------------
  const handleCheckout = (plan) => {
    if (!requireLogin()) return;
    premium.startCheckout(plan, user.email);
  };

  // ------------------------------------------------------------------
  // Free trial
  // ------------------------------------------------------------------
  const handleStartTrial = () => {
    if (!requireLogin()) return;

    premium.startTrial();
    alert(t("premium_trial_started"));
    navigate("/dashboard");
  };

  // ------------------------------------------------------------------
  // Included Features
  // ------------------------------------------------------------------
  const features = [
    t("premium_feature_unlimited_subs"),
    t("premium_feature_advanced_intervals"),
    t("premium_feature_multi_currency"),
    t("premium_feature_cloud_backup"),
    t("premium_feature_sync"),
    t("premium_feature_priority_support"),
  ];

  return (
    <div className="w-full px-4 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-b from-blue-600 to-blue-900 text-white shadow-2xl p-6 sm:p-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
            {t("premium_title")}
          </h1>

          <p className="text-sm sm:text-base text-blue-100 mb-3 sm:mb-4">
            {t("premium_subtitle")}
          </p>

          {reason === "limit" && (
            <p className="text-xs sm:text-sm text-blue-200 mb-3">
              {t("premium_reason_limit")}
            </p>
          )}

          {reason === "currency" && (
            <p className="text-xs sm:text-sm text-blue-200 mb-3">
              {t("premium_reason_currency")}
            </p>
          )}
        </div>

        {/* ------------------------------------------- */}
        {/* FEATURES BOX */}
        {/* ------------------------------------------- */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-8 shadow-inner border border-white/20 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-center">
            {t("premium_whats_included")}
          </h2>

          <ul className="space-y-2 sm:space-y-3 text-blue-100 text-sm sm:text-base max-w-md mx-auto">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 sm:gap-3">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------------------------------- */}
        {/* PREMIUM ALREADY ACTIVE (PAID USER) */}
        {/* ------------------------------------------- */}
        {isPaidPremium && (
          <div className="text-center text-green-300 font-semibold mb-6">
            {t("premium_active_message")}
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* PRICING CARDS (Only show if NOT paid premium) */}
        {/* ------------------------------------------- */}
        {!isPaidPremium && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* MONTHLY */}
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-1 text-center">
                {t("premium_monthly")}
              </h3>
              <div className="text-3xl sm:text-5xl font-bold mb-1 text-center">€4</div>
              <div className="text-blue-200 text-center text-xs sm:text-sm mb-3">
                {t("premium_month")}
              </div>

              <button
                onClick={() => handleCheckout("monthly")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-lg transition active:scale-95"
              >
                {t("premium_button_upgrade")}
              </button>
            </div>

            {/* YEARLY */}
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg text-center sm:text-xl font-semibold mb-1">
                {t("premium_yearly")}
              </h3>
              <div className="text-3xl sm:text-5xl text-center font-bold mb-1">€40</div>
              <div className="text-blue-200 text-xs text-center sm:text-sm mb-3">
                {t("premium_year")}
              </div>

              <button
                onClick={() => handleCheckout("yearly")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-lg transition active:scale-95"
              >
                {t("premium_button_upgrade")}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* TRIAL SECTION (show only if NOT paid premium) */}
        {/* ------------------------------------------- */}
        {!isPaidPremium && (
          <>
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl text-xs sm:text-sm border border-white/20 max-w-lg mx-auto mb-4 sm:mb-6 text-center">
              <p>“{t("premium_testimonial")}”</p>
            </div>

            <p className="mt-1 mb-3 text-xs sm:text-sm text-blue-200 text-center">
              {t("premium_7day_trial")}
            </p>

            {!trialActive ? (
              <button
                onClick={handleStartTrial}
                className="block mx-auto text-xs sm:text-sm underline text-blue-100 hover:text-white"
              >
                {t("premium_start_trial")}
              </button>
            ) : (
              <p className="text-center text-blue-200 text-xs sm:text-sm">
                {t("premium_trial_active_until")}{" "}
                {new Date(premium.trialEnds).toLocaleDateString()}
              </p>
            )}
          </>
        )}

        {/* ------------------------------------------- */}
        {/* BACK BUTTON */}
        {/* ------------------------------------------- */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[11px] sm:text-xs text-blue-100 underline"
          >
            {t("button_back") || "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
