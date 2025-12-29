// src/components/insights/InsightsAchievements.jsx
import React from "react";
import { motion } from "framer-motion";

export default function AchievementsCard({ data = {} }) {
  const total = data?.totalThisMonth ?? 0;
  const growth = data?.growthRate ?? 0;
  const monthsTracked = data?.trends?.length ?? 0;

  // === Achievement logic ===
  const achievements = [
    {
      id: 1,
      icon: "🏦",
      title: "Saver Mode",
      description: "Great job staying frugal this month.",
      color: "#22c55e",
      earned: total < (data?.avgMonthly ?? 10), // spent less than your avg
    },
    {
      id: 2,
      icon: "📈",
      title: "Consistent Tracker",
      description: "6+ months of tracking activity!",
      color: "#3b82f6",
      earned: monthsTracked >= 6, // user has at least 6 months tracked
    },
    {
      id: 3,
      icon: "🔥",
      title: "High Roller",
      description: "You hit a new spending peak this year.",
      color: "#f59e0b",
      earned: growth > 15, // big increase in monthly spend
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div
      className="rounded-xl bg-gradient-to-b from-white/5 to-gray-900/40 
      dark:from-[#0e1420] dark:to-[#1a1f2a] border border-gray-700/50 
      shadow-lg shadow-black/20 backdrop-blur-sm p-4 mt-2"
    >
      <h3 className="text-sm font-semibold text-gray-100 border-b border-gray-700/60 pb-2 mb-3">
        Achievements
      </h3>

      {earnedCount === 0 ? (
        <p className="text-xs text-gray-400 italic px-1">
          🌱 Keep tracking — achievements unlock as you build your data!
        </p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-3">
        {achievements.map((ach) => (
          <motion.div
            key={ach.id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-300
              ${ach.earned
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/60 border-gray-700/60 hover:border-[#ed7014]/60"
                : "bg-gradient-to-br from-gray-900/40 to-gray-900/20 border-gray-800/40 opacity-60"
              }`}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner"
            >
              <div
                className="absolute inset-0 blur-md opacity-40 rounded-full"
                style={{ backgroundColor: ach.color }}
              />
              <span className="relative text-xl">{ach.icon}</span>
            </div>

            {/* Text */}
            <div>
              <h4 className="text-sm font-bold text-gray-100">{ach.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{ach.description}</p>
            </div>

            {/* Badge */}
            {ach.earned && (
              <div className="absolute right-3 top-3 text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-600/30">
                ✓ Earned
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
