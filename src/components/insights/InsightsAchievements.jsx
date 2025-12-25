// src/components/insights/InsightsAchievements.jsx
import React from "react";
import { motion } from "framer-motion";

export default function InsightsAchievements({ data }) {
  const achievements = [];

  if (data.growthRate < 0)
    achievements.push({ icon: "💰", title: "Under Budget", desc: "You've reduced your monthly spending!" });
  if (data.totalThisMonth < 100)
    achievements.push({ icon: "🪙", title: "Saver Mode", desc: "Great job staying frugal this month." });
  if (data.topCategory && data.topCategory?.[1] > 50)
    achievements.push({ icon: "🎬", title: "Streaming Fan", desc: "Your top category is entertainment!" });
  if ((data.trends?.length ?? 0) > 6)
    achievements.push({ icon: "📈", title: "Consistent Tracker", desc: "6+ months of tracking activity!" });

  if (!achievements.length)
    achievements.push({ icon: "🌟", title: "Explorer", desc: "Keep tracking to unlock more insights." });

  return (
    <div className="rounded-xl bg-[#0e1420] border border-gray-800/60 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-100 border-b border-gray-700/60 pb-2 mb-3">Achievements</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg"
          >
            <div className="text-2xl">{a.icon}</div>
            <div>
              <div className="text-gray-100 font-medium">{a.title}</div>
              <div className="text-xs text-gray-400">{a.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
