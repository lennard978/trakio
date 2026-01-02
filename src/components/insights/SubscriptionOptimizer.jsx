// src/components/insights/SubscriptionOptimizer.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LightBulbIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { getCurrencyFlag } from "../../utils/currencyFlags";

/**
 * Phase-1 MVP:
 * - Local optimizer (real)
 * - AI preview (mocked)
 * - NO backend dependency
 */

const AI_ENABLED = true;

export default function SubscriptionOptimizer({
  subscriptions = [],
  currency = "EUR",
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* --------------------------------------------------
   * Local optimization (REAL logic)
   * -------------------------------------------------- */
  const localSuggestions = useMemo(() => {
    if (!subscriptions.length) return [];

    const suggestions = [];

    // Group by category
    const byCategory = {};
    subscriptions.forEach((s) => {
      const cat = s.category || "Other";
      byCategory[cat] ??= [];
      byCategory[cat].push(s);
    });

    // Overlaps
    Object.entries(byCategory).forEach(([cat, subs]) => {
      if (
        subs.length > 1 &&
        ["Streaming", "Music", "Cloud", "Productivity"].includes(cat)
      ) {
        const total = subs.reduce((a, s) => a + (s.price || 0), 0);
        suggestions.push({
          source: "local",
          text: t("optimize_overlap", { cat, count: subs.length }),
          potentialSaving: total * 0.4,
        });
      }
    });

    // High-cost subs
    const avg =
      subscriptions.reduce((a, s) => a + (s.price || 0), 0) /
      subscriptions.length;

    subscriptions
      .filter((s) => s.price > avg * 1.5)
      .forEach((s) =>
        suggestions.push({
          source: "local",
          text: t("optimize_high_cost", { name: s.name }),
          potentialSaving: s.price * 0.2,
        })
      );

    // Inactive subs
    subscriptions
      .filter((s) => s.usageCount === 0)
      .forEach((s) =>
        suggestions.push({
          source: "local",
          text: t("optimize_inactive", { name: s.name }),
          potentialSaving: s.price,
        })
      );

    return suggestions;
  }, [subscriptions, t]);

  /* --------------------------------------------------
   * Mocked AI preview (Phase-1 only)
   * -------------------------------------------------- */
  async function runAI() {
    setLoading(true);

    // Simulated delay (UX polish)
    await new Promise((r) => setTimeout(r, 700));

    setAiResults([
      {
        recommendation:
          "You are subscribed to multiple streaming platforms. Consider keeping only one to reduce monthly costs.",
        estimated_saving: 13.99,
      },
      {
        recommendation:
          "Apple One already includes Music and iCloud+. Cancelling standalone plans could save money.",
        estimated_saving: 27,
      },
    ]);

    setLoading(false);
  }

  const merged = [
    ...localSuggestions,
    ...aiResults.map((r) => ({
      source: "ai",
      text: r.recommendation,
      potentialSaving: r.estimated_saving,
    })),
  ];

  const totalSavings = merged
    .reduce((a, s) => a + (s.potentialSaving || 0), 0)
    .toFixed(2);

  /* --------------------------------------------------
   * Render
   * -------------------------------------------------- */
  return (
    <div
      className="
        rounded-2xl
        border border-gray-300 dark:border-gray-800/70
        bg-white dark:bg-[#0e1420]
        shadow-md dark:shadow-inner dark:shadow-[#141824]
        p-4 mt-4
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-[#ED7014]" />
          <h3 className="text-sm font-semibold">
            {t("optimizer_title", "Optimize My Subscriptions")}
          </h3>

          {/* Beta badge */}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ED7014]/20 text-[#ED7014] font-semibold">
            AI Preview · Beta
          </span>
        </div>

        <button
          onClick={async () => {
            setOpen((v) => !v);
            if (!open && AI_ENABLED) await runAI();
          }}
          className="
            flex items-center gap-1
            text-xs px-3 py-1 rounded-full
            bg-[#ED7014] text-white
            hover:opacity-90 transition
          "
        >
          <Cog6ToothIcon className="w-4 h-4" />
          {open ? t("hide") : t("analyze")}
        </button>
      </div>

      {!open && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {t(
            "optimizer_hint",
            "Find overlapping, inactive or overpriced subscriptions."
          )}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 mt-3"
          >
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SparklesIcon className="w-4 h-4 animate-spin text-[#ED7014]" />
                {t("optimizer_ai_loading", "Analyzing subscriptions…")}
              </div>
            )}

            {!loading &&
              merged.map((r, i) => (
                <div
                  key={i}
                  className={`
                    flex justify-between items-center
                    p-3 rounded-lg text-xs
                    border
                    ${r.source === "ai"
                      ? "border-[#ED7014]/40 bg-[#ED7014]/10 text-[#ED7014]"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
                    }
                  `}
                >
                  <span>{r.text}</span>
                  <span className="font-semibold whitespace-nowrap">
                    {getCurrencyFlag(currency)}{" "}
                    {r.potentialSaving.toFixed(2)}
                  </span>
                </div>
              ))}

            {!loading && merged.length > 0 && (
              <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-[#ED7014]">
                <BanknotesIcon className="w-5 h-5" />
                {t("optimizer_total_savings", {
                  total: totalSavings,
                  currency,
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
