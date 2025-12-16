import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";

export default function Success() {
  const navigate = useNavigate();
  const premium = usePremium();
  const [status, setStatus] = useState("activating");

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;

      const data = await premium.refreshPremiumStatus();

      if (data?.isPremium === true) {
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
              Activating Premium…
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We’re confirming your subscription. This may take a few seconds.
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-xl font-semibold mb-3">
              Premium activated
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard…
            </p>
          </>
        )}

        {status === "timeout" && (
          <>
            <h1 className="text-xl font-semibold mb-3">
              Payment received
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your payment was successful, but Premium is still syncing.
              This usually resolves within a minute.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
