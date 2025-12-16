import React from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";

import PremiumFeatureRow from "../components/PremiumFeatureRow";

export default function Premium() {
  const premium = usePremium();
  const navigate = useNavigate();

  if (premium.isPremium) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <h1 className="text-2xl font-bold mb-3">
          You’re Premium 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          All premium features are unlocked.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">
        Upgrade to Premium
      </h1>

      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Stop paying for subscriptions you forgot.
      </p>

      {/* FEATURES */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border dark:border-gray-800 p-5 mb-6">
        <PremiumFeatureRow
          title="Upcoming payments overview"
          free
          premium
        />
        <PremiumFeatureRow
          title="Monthly budget & progress"
          premium
        />
        <PremiumFeatureRow
          title="Price increase alerts"
          premium
        />
        <PremiumFeatureRow
          title="Forgotten subscriptions detection"
          premium
        />
        <PremiumFeatureRow
          title="Advanced analytics & timeline"
          premium
        />
        <PremiumFeatureRow
          title="CSV export"
          premium
        />
      </div>

      {/* PRICING */}
      <div className="grid grid-cols-1 gap-4">
        {/* MONTHLY */}
        <div className="border rounded-2xl p-4 text-center dark:border-gray-800">
          <h3 className="font-semibold mb-1">Monthly</h3>
          <div className="text-2xl font-bold mb-3">€4 / month</div>

          <button
            disabled={premium.loading}
            onClick={() => premium.startCheckout("monthly")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl disabled:opacity-50"
          >
            Upgrade Monthly
          </button>
        </div>

        {/* YEARLY */}
        <div className="border-2 border-blue-500 rounded-2xl p-4 text-center relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
            Most popular
          </span>

          <h3 className="font-semibold mb-1">Yearly</h3>
          <div className="text-2xl font-bold mb-1">€40 / year</div>
          <div className="text-xs text-gray-500 mb-3">
            Save 17%
          </div>

          <button
            disabled={premium.loading}
            onClick={() => premium.startCheckout("yearly")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl disabled:opacity-50"
          >
            Upgrade Yearly
          </button>
        </div>
      </div>

      {/* TRUST */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
        Cancel anytime · Secure payments via Stripe · No bank connection
      </div>
    </div>
  );
}
