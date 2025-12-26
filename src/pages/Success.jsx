import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";
import { useTranslation } from "react-i18next";

export default function Success() {
  const navigate = useNavigate();
  const premium = usePremium();
  const [status, setStatus] = useState("activating");
  const { t } = useTranslation();
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;

      const data = await premium.refreshPremiumStatus();
      console.log("Stripe refresh data:", data); // ✅ safe here

      if (data?.status === "active" || data?.status === "trialing") {
        clearInterval(interval);
        setStatus("ready");
        setTimeout(() => navigate("/dashboard"), 1200);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus("timeout");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [premium, navigate]);



  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
        {status === "activating" && (
          <>
            <h1 className="text-xl font-semibold mb-3">
              {t("success_activating_title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("success_activating_message")}
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-xl font-semibold mb-3">
              {t("success_ready_title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("success_ready_message")}
            </p>
          </>
        )}

        {status === "timeout" && (
          <>
            <h1 className="text-xl font-semibold mb-3">
              {t("success_timeout_title")}
            </h1>
            <p className="text-sm text-red-500 font-medium">
              {t("success_timeout_message")}{" "}
              <button
                onClick={() => window.location.reload()}
                className="underline ml-1"
              >
                {t("success_timeout_refresh")}
              </button>.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
            >
              {t("success_button_dashboard")}
            </button>
          </>
        )}
      </div>
    </div>

  );
}
