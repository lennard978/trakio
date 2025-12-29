// src/components/insights/SubscriptionOptimizer.jsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LightBulbIcon, Cog6ToothIcon, BanknotesIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { getCurrencyFlag } from "../../utils/currencyFlags";

// Toggle for AI-powered optimization
const AI_ENABLED = true;

export default function SubscriptionOptimizer({ subscriptions = [], currency, rates }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // === LOCAL ANALYSIS ===
  const localSuggestions = useMemo(() => {
    if (!subscriptions?.length) return [];

    const suggestions = [];

    const byCategory = {};
    subscriptions.forEach((sub) => {
      const cat = sub.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(sub);
    });

    Object.entries(byCategory).forEach(([cat, subs]) => {
      if (subs.length > 1 && ["Streaming", "Productivity", "Cloud", "Music"].includes(cat)) {
        const total = subs.reduce((acc, s) => acc + (s.price || 0), 0);
        suggestions.push({
          source: "local",
          type: "overlap",
          category: cat,
          text: t("optimize_overlap", { cat, count: subs.length }),
          potentialSaving: total * 0.4,
          subs: subs.map((s) => s.name).join(", "),
        });
      }
    });

    const avg = subscriptions.reduce((a, s) => a + (s.price || 0), 0) / subscriptions.length;
    subscriptions
      .filter((s) => s.price > avg * 1.5)
      .forEach((s) =>
        suggestions.push({
          source: "local",
          type: "high_cost",
          text: t("optimize_high_cost", { name: s.name }),
          potentialSaving: s.price * 0.2,
        })
      );

    subscriptions
      .filter((s) => s.usageCount === 0)
      .forEach((s) =>
        suggestions.push({
          source: "local",
          type: "inactive",
          text: t("optimize_inactive", { name: s.name }),
          potentialSaving: s.price,
        })
      );

    return suggestions;
  }, [subscriptions, t]);

  // === AI-POWERED ANALYSIS ===
  async function fetchAIRecommendations() {
    setLoading(true);

    try {
      const formatted = subscriptions.map((s) => ({
        name: s.name,
        category: s.category,
        price: s.price,
        frequency: s.frequency,
        usageCount: s.usageCount,
      }));

      // You’ll later replace this with an actual OpenAI API call
      const prompt = `
You are a finance optimization assistant.
Analyze these subscriptions and suggest possible cost reductions or overlaps.

Data:
${JSON.stringify(formatted, null, 2)}

Format your answer as JSON:
[
  { "recommendation": "text", "estimated_saving": number }
]
`;

      // 🔧 Mocked AI response (for offline use)
      const mockAIResponse = [
        {
          recommendation: "You are paying for multiple streaming services (Netflix, Disney+). Consolidate to save around €13.99/month.",
          estimated_saving: 13.99,
        },
        {
          recommendation: "Apple One includes iCloud+ and Music — cancel standalone subscriptions to save €27/month.",
          estimated_saving: 27,
        },
      ];

      // In production:
      // const aiResponse = await fetch("/api/openai-optimize", { method: "POST", body: JSON.stringify({ prompt }) });
      // const data = await aiResponse.json();

      setAiResults(mockAIResponse);
    } catch (err) {
      console.error("AI Optimization failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalPotential =
    [...localSuggestions, ...aiResults].reduce(
      (a, s) => a + (s.potentialSaving || s.estimated_saving || 0),
      0
    ).toFixed(2);

  const mergedResults = [
    ...localSuggestions,
    ...aiResults.map((r) => ({
      source: "ai",
      text: r.recommendation,
      potentialSaving: r.estimated_saving,
    })),
  ];

  return (
    <div className="rounded-xl bg-gradient-to-b from-white/5 to-gray-900/40 
      dark:from-[#0e1420] dark:to-[#1a1f2a] border border-gray-800/70 
      shadow-md shadow-[#141824] p-4 mt-3">
      <div className="flex justify-between items-center border-b border-gray-700/60 pb-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-100">
          {t("optimizer_title", "Optimize My Subscriptions")}
        </h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-[#ED7014] text-white shadow hover:opacity-90"
          onClick={async () => {
            setShow(!show);
            if (!show && AI_ENABLED) await fetchAIRecommendations();
          }}
        >
          <Cog6ToothIcon className="w-4 h-4" /> {show ? t("hide") : t("analyze")}
        </motion.button>
      </div>

      {!show && (
        <p className="text-xs text-gray-400 italic">
          {t("optimizer_hint", "Click analyze to find overlapping or overpriced subscriptions.")}
        </p>
      )}

      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {loading && (
            <div className="flex items-center text-xs text-gray-400 gap-2">
              <SparklesIcon className="w-4 h-4 animate-spin text-[#ED7014]" />
              {t("optimizer_ai_loading", "Analyzing subscriptions using AI...")}
            </div>
          )}

          {!loading &&
            mergedResults.map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border ${r.source === "ai"
                    ? "border-[#ED7014]/40 bg-[#ed7014]/10 text-[#ed7014]"
                    : "border-gray-700/60 bg-gray-800/50 text-gray-300"
                  } text-xs`}
              >
                <div className="flex justify-between items-center">
                  <span>{r.text}</span>
                  <span className="font-semibold">
                    {getCurrencyFlag(currency)} {r.potentialSaving?.toFixed?.(2) || "0.00"}
                  </span>
                </div>
              </motion.div>
            ))}

          {!loading && mergedResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm mt-3 text-[#ED7014] font-semibold">
              <BanknotesIcon className="w-5 h-5" />
              {t("optimizer_total_savings", {
                total: totalPotential,
                currency,
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
