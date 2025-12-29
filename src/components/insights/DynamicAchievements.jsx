// src/components/insights/DynamicAchievements.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  SparklesIcon,
  FireIcon,
  ChartBarIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function DynamicAchievements({ data, currency }) {
  const { t } = useTranslation();

  // 🧠 Compute dynamic achievements
  const achievements = useMemo(() => {
    if (!data) return [];

    const items = [];

    if (data?.growthRate < -5) {
      items.push({
        icon: <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />,
        title: t("dynamic_spending_drop_title"),
        desc: t("dynamic_spending_drop_desc", {
          percent: Math.abs(data.growthRate).toFixed(1),
        }),
      });
    }

    if (data?.totalThisMonth < (data?.avgMonthly || 0)) {
      items.push({
        icon: <SparklesIcon className="w-5 h-5 text-blue-400" />,
        title: t("dynamic_budget_guardian_title"),
        desc: t("dynamic_budget_guardian_desc"),
      });
    }

    if ((data?.trends?.length ?? 0) >= 6) {
      items.push({
        icon: <FireIcon className="w-5 h-5 text-orange-400" />,
        title: t("dynamic_consistency_title"),
        desc: t("dynamic_consistency_desc"),
      });
    }

    if (data?.categories) {
      const top = Object.entries(data.categories)
        .sort((a, b) => b[1] - a[1])[0];
      if (top) {
        items.push({
          icon: <ChartBarIcon className="w-5 h-5 text-purple-400" />,
          title: t("dynamic_top_category_title"),
          desc: t("dynamic_top_category_desc", { category: top[0] }),
        });
      }
    }

    return items;
  }, [data, t]);

  const hasInsights =
    data &&
    (data.totalThisMonth > 0 ||
      (data.trends && data.trends.length > 0) ||
      (data.categories && Object.keys(data.categories).length > 0));

  // 💬 Smart Advisor Tip logic (now category-aware)
  const advisorTip = useMemo(() => {
    if (!hasInsights || !data) return null;

    const tips = [];

    // 🔹 Basic trend-based tips
    const savingPotential = Math.max(0, data.avgMonthly - data.totalThisMonth).toFixed(2);
    if (savingPotential > 5) {
      tips.push(
        t("advisor_save_tip", { amount: savingPotential, currency })
      );
    }

    if (data.growthRate > 10) {
      tips.push(
        t("advisor_growth_tip", { percent: data.growthRate.toFixed(1) })
      );
    }

    if (data.trends?.length > 8) {
      tips.push(t("advisor_tracking_tip"));
    }

    // 🔸 Category-aware advice
    if (data.categories && Object.keys(data.categories).length > 0) {
      const entries = Object.entries(data.categories);
      const total = entries.reduce((acc, [, v]) => acc + v, 0);
      const top = entries.sort((a, b) => b[1] - a[1])[0];
      const [category, amount] = top;
      const percent = (amount / total) * 100;

      if (percent > 30) {
        tips.push(
          t("advisor_category_dominant_tip", {
            category,
            percent: percent.toFixed(1),
          })
        );
      } else if (percent < 10 && entries.length > 3) {
        tips.push(
          t("advisor_balanced_spending_tip")
        );
      }
    }

    return tips.length
      ? tips[Math.floor(Math.random() * tips.length)]
      : t("advisor_default_tip");
  }, [data, hasInsights, t, currency]);

  return (
    <div
      className="rounded-xl bg-gradient-to-b from-white/5 to-gray-900/40 
      dark:from-[#0e1420] dark:to-[#1a1f2a] border border-gray-800/70 
      shadow-md shadow-[#141824] p-4 mt-3"
    >
      <h3 className="text-sm font-semibold text-gray-100 border-b border-gray-700/60 pb-2 mb-3">
        {t("dynamic_insights_title")}
      </h3>

      {/* 🌱 No data message */}
      {!hasInsights && (
        <div className="flex items-center gap-2 p-3 text-xs text-gray-400 italic">
          🌱 {t("dynamic_insights_no_data", "Start adding subscriptions to unlock personalized insights.")}
        </div>
      )}

      {/* ✨ Dynamic achievements */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          {achievements.map((ach, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-lg
              bg-gradient-to-br from-gray-800/50 to-gray-900/60
              border border-gray-700/60 hover:border-[#ed7014]/60 transition-all duration-300"
            >
              {ach.icon}
              <div>
                <div className="text-gray-100 font-semibold text-sm">
                  {ach.title}
                </div>
                <div className="text-xs text-gray-400">{ach.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 💬 Smart Advisor Tip */}
      {advisorTip && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 p-3 rounded-lg border border-[#ed7014]/40 bg-[#ed7014]/10 text-xs text-[#ed7014] flex items-start gap-2"
        >
          <LightBulbIcon className="w-4 h-4 mt-[2px]" />
          <p>{advisorTip}</p>
        </motion.div>
      )}
    </div>
  );
}
