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
  const email = user?.email || "";


  const reason = new URLSearchParams(location.search).get("reason");

  const features = [
    t("premium_feature_unlimited_subs"),
    t("premium_feature_advanced_intervals"),
    t("premium_feature_multi_currency"),
    t("premium_feature_cloud_backup"),
    t("premium_feature_sync"),
    t("premium_feature_priority_support"),
  ];

  const handleStartTrial = () => {
    premium.startTrial();
    alert(t("premium_trial_started"));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-600 to-blue-900 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
          {t("premium_title")}
        </h1>

        <p className="text-lg text-blue-100 mb-4">
          {t("premium_subtitle")}
        </p>

        {reason === "limit" && (
          <p className="text-blue-200 mb-4">{t("premium_reason_limit")}</p>
        )}

        {reason === "currency" && (
          <p className="text-blue-200 mb-4">{t("premium_reason_currency")}</p>
        )}

        {/* Features */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("premium_whats_included")}</h2>

          <ul className="space-y-3 text-blue-100 text-left mx-auto max-w-sm">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-base">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* Monthly */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold mb-2">{t("premium_monthly")}</h3>
            <div className="text-5xl font-bold mb-1">€4</div>
            <div className="text-blue-200 mb-4 text-sm">{t("premium_month")}</div>

            <button
              onClick={() => premium.startCheckout("monthly", email)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg transition active:scale-95"
            >
              {t("premium_button_upgrade")}
            </button>
          </div>

          {/* Yearly */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold mb-2">{t("premium_yearly")}</h3>
            <div className="text-5xl font-bold mb-1">€40</div>
            <div className="text-blue-200 mb-4 text-sm">{t("premium_year")}</div>

            <button
              onClick={() => premium.startCheckout("yearly", email)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg transition active:scale-95"
            >
              {t("premium_button_upgrade")}
            </button>
          </div>
        </div>

        {/* Trial */}
        <p className="mt-2 text-blue-200 text-sm mb-4">{t("premium_7day_trial")}</p>

        <button
          onClick={handleStartTrial}
          className="text-sm underline text-blue-100 hover:text-white"
        >
          {t("premium_start_trial")}
        </button>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-blue-100 underline"
          >
            {t("button_back") || "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
