import React from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";
import PremiumFeatureRow from "../components/PremiumFeatureRow";
import PlanComparison from "../components/premium/PlanComparison";

export default function Premium() {
  const premium = usePremium();
  const navigate = useNavigate();

  if (premium.isPremium) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center px-4">
        <h1 className="text-3xl font-bold mb-3">
          Premium unlocked 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You now have full access to Trakio’s advanced features.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-10">
      {/* ================= HERO ================= */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold">
          Take control of your subscriptions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trakio Premium helps you avoid forgotten payments,
          track spending clearly, and stay in control — effortlessly.
        </p>
      </section>

      {/* ================= VALUE PROPS ================= */}
      <section className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border dark:border-gray-800 p-4">
          <h3 className="font-semibold mb-1">Never forget a payment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get a clear timeline of upcoming renewals and alerts before charges.
          </p>
        </div>

        <div className="rounded-2xl border dark:border-gray-800 p-4">
          <h3 className="font-semibold mb-1">Understand your real monthly spend</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See how much subscriptions truly cost you per month and year.
          </p>
        </div>

        <div className="rounded-2xl border dark:border-gray-800 p-4">
          <h3 className="font-semibold mb-1">Spot waste automatically</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detect unused or unhealthy subscriptions before they drain money.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-5 space-y-2">
        <h2 className="text-lg font-semibold mb-2">
          What you get with Premium
        </h2>

        <PremiumFeatureRow title="Upcoming payments overview" free premium />
        <PremiumFeatureRow title="Monthly budget & progress tracking" premium />
        <PremiumFeatureRow title="Price increase alerts" premium />
        <PremiumFeatureRow title="Forgotten subscription detection" premium />
        <PremiumFeatureRow title="Advanced analytics & timeline" premium />
        <PremiumFeatureRow title="CSV export" premium />
      </section>

      <PlanComparison />

      {/* ================= PRICING ================= */}
      <section className="grid grid-cols-1 gap-4">
        {/* Monthly */}
        <div className="border rounded-2xl p-5 text-center dark:border-gray-800">
          <h3 className="font-semibold mb-1">Monthly</h3>
          <div className="text-2xl font-bold mb-3">€4 / month</div>

          <button
            disabled={premium.loading}
            onClick={() => premium.startCheckout("monthly")}
            className="w-full bg-gray-900 dark:bg-gray-700 hover:opacity-90 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Upgrade monthly
          </button>
        </div>

        {/* Yearly */}
        <div className="border-2 border-blue-500 rounded-2xl p-5 text-center relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
            Best value
          </span>

          <h3 className="font-semibold mb-1">Yearly</h3>
          <div className="text-2xl font-bold mb-1">€40 / year</div>
          <div className="text-xs text-gray-500 mb-4">
            Save ~17% compared to monthly
          </div>

          <button
            disabled={premium.loading}
            onClick={() => premium.startCheckout("yearly")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Upgrade yearly
          </button>
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Cancel anytime · No long-term commitment</p>
        <p>Secure payments via Stripe · No bank access required</p>
        <p>You’ll be redirected to Stripe for checkout</p>
      </section>
    </div>
  );
}
