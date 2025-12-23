import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../hooks/usePremium";

import PremiumFeatureRow from "../components/PremiumFeatureRow";

export default function Premium() {
  const premium = usePremium();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  /* -------------------- Already Premium -------------------- */
  if (premium.isPremium) {
    return (
      <div className="max-w-xl mx-auto mt-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">
          You’re Premium 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          All premium features are unlocked and ready to use.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow"
        >
          Go to Dashboard
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
          Upgrade to Premium
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take full control of your subscriptions — and your money.
        </p>
      </div>

      {/* VALUE PROPS */}
      <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>Never forget a subscription renewal again</span>
        </div>
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>See upcoming payments before they hit your bank</span>
        </div>
        <div className="flex gap-2 items-start">
          <span>✔️</span>
          <span>Get alerted before subscriptions silently get more expensive</span>
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border dark:border-gray-800 p-5 space-y-3">
        <PremiumFeatureRow title="Upcoming payments overview" free premium />
        <PremiumFeatureRow title="Monthly budget overview & spending progress" premium />
        <PremiumFeatureRow title="Price increase alerts" premium />
        <PremiumFeatureRow title="Detect forgotten and unused subscriptions" premium />
        <PremiumFeatureRow title="Advanced analytics & payment timeline" premium />
        <PremiumFeatureRow title="CSV export for reports & backups" premium />
      </div>


      {/* LEGAL CONSENT */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
          />

          <span>
            Ich akzeptiere die{" "}
            <a href="/agb" target="_blank" className="underline">
              AGB
            </a>{" "}
            und die{" "}
            <a href="/datenschutz" target="_blank" className="underline">
              Datenschutzerklärung
            </a>{" "}
            und stimme ausdrücklich zu, dass der Vertrag vor Ablauf der
            Widerrufsfrist ausgeführt wird.
          </span>
        </label>
      </div>


      {/* PRICING */}
      <div className="grid gap-4">
        {/* MONTHLY */}
        <div className="border rounded-2xl p-5 text-center dark:border-gray-800">
          <h3 className="font-semibold mb-1">Monthly</h3>
          <div className="text-3xl font-bold mb-1">€4</div>
          <p className="text-sm text-gray-500 mb-4">
            Billed monthly · Cancel anytime
          </p>

          <button
            disabled={!accepted || premium.loading}
            onClick={() => premium.startCheckout("monthly")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            Start Monthly Plan
          </button>

          <p className="text-xs text-gray-500 mt-2">
            7-day free trial · Cancel anytime
          </p>
        </div>

        {/* YEARLY */}
        <div className="border-2 border-blue-600 rounded-2xl p-5 text-center relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            Best value
          </span>

          <h3 className="font-semibold mb-1">Yearly</h3>
          <div className="text-3xl font-bold mb-1">€40</div>
          <p className="text-xs text-gray-500 mb-4">
            Save 17% · €3.33 / month
          </p>

          <button
            disabled={!accepted || premium.loading}
            onClick={() => premium.startCheckout("yearly")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            Start Yearly Plan
          </button>

          <p className="text-xs text-gray-500 mt-2">
            7-day free trial · Cancel anytime
          </p>
        </div>
      </div>

      {/* TRUST */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>• 7-day free trial</div>
        <div>• Cancel anytime in one click</div>
        <div>• Secure payments handled by Stripe</div>
        <div>• We never access your bank account</div>
      </div>
    </div>
  );
}
