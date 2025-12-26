// src/components/insights/InsightsAchievements.jsx
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function InsightsAchievements({ data }) {
  const { t } = useTranslation();
  const achievements = [];

  if (data.growthRate < 0)
    achievements.push({
      icon: "💰",
      title: t("achievements_under_budget_title"),
      desc: t("achievements_under_budget_desc"),
    });

  if (data.totalThisMonth < 100)
    achievements.push({
      icon: "🪙",
      title: t("achievements_saver_mode_title"),
      desc: t("achievements_saver_mode_desc"),
    });

  if (data.topCategory && data.topCategory?.[1] > 50)
    achievements.push({
      icon: "🎬",
      title: t("achievements_streaming_fan_title"),
      desc: t("achievements_streaming_fan_desc"),
    });

  if ((data.trends?.length ?? 0) > 6)
    achievements.push({
      icon: "📈",
      title: t("achievements_consistent_tracker_title"),
      desc: t("achievements_consistent_tracker_desc"),
    });

  if (!achievements.length)
    achievements.push({
      icon: "🌟",
      title: t("achievements_explorer_title"),
      desc: t("achievements_explorer_desc"),
    });

  return (
    <div
      className="rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-[#0e1420] dark:to-[#1a1f2a]
      border border-gray-300 dark:border-gray-800/70 shadow-md dark:shadow-inner dark:shadow-[#141824]
      hover:border-[#ed7014]/60 hover:shadow-[#ed7014]/20 transition-all duration-300 p-4"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700/60 pb-2 mb-3">
        {t("achievements_title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex items-start gap-3 bg-gray-200/70 dark:bg-gray-800/50 p-3 rounded-lg 
            hover:border-[#ed7014]/40 hover:shadow-md hover:shadow-[#ed7014]/10 border border-transparent transition-all"
          >
            <div className="text-2xl">{a.icon}</div>
            <div>
              <div className="text-gray-900 dark:text-gray-100 font-medium">{a.title}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{a.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
