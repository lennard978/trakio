// src/pages/Settings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { usePremiumContext } from "../context/PremiumContext";

// Reusable UI components
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const premium = usePremiumContext();
  const { isPremium, trialEnds } = premium;

  // CUSTOMER PORTAL
  const handleManageSubscription = async () => {
    const email = user?.email;
    if (!email) {
      showToast("Please log in again.", "error");
      return;
    }

    if (trialEnds) {
      showToast("Trial users cannot manage subscription yet.", "error");
      return;
    }

    const res = await fetch("/api/stripe/customer-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);

    if (data?.url) window.location.href = data.url;
    else showToast("Unable to open customer portal.", "error");
  };

  // TRIAL INFO
  const getTrialInfo = () => {
    const now = new Date();
    if (!trialEnds && !isPremium) return t("settings_trial_not_started");

    const end = trialEnds ? new Date(trialEnds) : null;

    if (trialEnds && now > end && !isPremium)
      return `${t("settings_trial_expired")}: ${end.toLocaleDateString()}`;

    if (trialEnds && now <= end && isPremium)
      return `${t("settings_trial_ends")}: ${end.toLocaleDateString()}`;

    if (isPremium && !trialEnds) return t("settings_premium_no_trial");

    return t("settings_trial_not_started");
  };

  // PREMIUM INFO
  const getPremiumInfo = () => {
    const now = new Date();
    if (isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now <= end) return t("settings_premium_trial_active");
    }
    if (isPremium && !trialEnds) return t("settings_premium_active");

    if (!isPremium && trialEnds) {
      const end = new Date(trialEnds);
      if (now > end) return `${t("settings_premium_trial_expired")}: ${end.toLocaleDateString()}`;
    }

    return t("settings_premium_none");
  };

  return (
    <div className="max-w-lg mx-auto mt-2 space-y-6 pb-20">
      <h1 className="text-2xl font-bold mb-2 px-2">{t("settings_title")}</h1>

      {/* ACCOUNT */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">{t("settings_account")}</h2>
        <p className="text-sm">
          {t("settings_email")}: <span className="font-semibold">{user?.email}</span>
        </p>
      </Card>

      {/* TRIAL */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">{t("settings_trial")}</h2>
        <p className="text-sm">{getTrialInfo()}</p>
      </Card>

      {/* PREMIUM */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">{t("settings_premium_title")}</h2>
        <p className="text-sm">{getPremiumInfo()}</p>

        {isPremium && !trialEnds && (
          <SettingButton variant="primary" onClick={handleManageSubscription} className="mt-4">
            Manage Subscription
          </SettingButton>
        )}

        {!isPremium && (
          <SettingButton variant="success" onClick={() => navigate("/premium")} className="mt-4">
            Upgrade to Premium
          </SettingButton>
        )}
      </Card>

      {/* ACTIONS */}
      <Card>
        <div className="flex flex-col gap-3">
          <SettingButton variant="danger" onClick={logout}>
            {t("settings_logout")}
          </SettingButton>

          <SettingButton variant="neutral" onClick={() => navigate("/dashboard")}>
            {t("settings_back_to_dashboard")}
          </SettingButton>
        </div>
      </Card>
    </div>
  );
}
