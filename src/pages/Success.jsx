import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";
import { useTranslation } from "react-i18next";

/**
 * Stripe Success Page
 * - Polls backend for premium activation
 * - Handles Stripe webhook propagation delay
 * - Redirects to dashboard on success
 */
export default function Success() {
  const navigate = useNavigate();
  const { refreshPremiumStatus } = usePremium();
  const { t } = useTranslation();

  const [status, setStatus] = useState("activating"); // activating | ready | timeout
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      attemptsRef.current += 1;

      try {
        const data = await refreshPremiumStatus();

        if (import.meta.env.DEV) {
          console.log("Stripe premium refresh:", data);
        }

        if (data?.status === "active" || data?.status === "trialing") {
          if (cancelled) return;

          clearTimeout(intervalRef.current);
          setStatus("ready");

          setTimeout(() => {
            if (!cancelled) navigate("/dashboard");
          }, 1200);

          return;
        }
      } catch (err) {
        console.error("Premium refresh failed:", err);
        // keep retrying until timeout
      }

      if (attemptsRef.current >= 10) {
        if (!cancelled) setStatus("timeout");
        return;
      }

      // Progressive backoff (Stripe-safe)
      const delay =
        attemptsRef.current < 3
          ? 2000
          : attemptsRef.current < 6
            ? 4000
            : 6000;

      intervalRef.current = setTimeout(poll, delay);
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(intervalRef.current);
    };
  }, [refreshPremiumStatus, navigate]);

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

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("success_timeout_message")}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="underline text-sm"
              >
                {t("success_timeout_refresh")}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
              >
                {t("success_button_dashboard")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
