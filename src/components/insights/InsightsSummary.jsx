import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function InsightsSummary({ data, currency }) {
  const summary = useMemo(() => {
    if (!data || !data.trends?.length) return "Not enough data to generate summary yet.";

    const lastMonth = data.trends.at(-2)?.total ?? 0;
    const thisMonth = data.trends.at(-1)?.total ?? 0;
    const growth = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const forecast = data.forecast ?? thisMonth * 1.05;

    const topCategory = Object.entries(data.categories || {})
      .sort((a, b) => b[1] - a[1])[0];

    let text = "";

    if (growth > 10) {
      text += `You spent ${growth.toFixed(1)}% more than last month. `;
    } else if (growth < -10) {
      text += `Nice job — your spending dropped ${Math.abs(growth).toFixed(1)}% compared to last month. `;
    } else {
      text += `Your spending stayed consistent this month. `;
    }

    if (topCategory) {
      text += `Your top category was **${topCategory[0]}**, totaling ${currency} ${topCategory[1].toFixed(2)}. `;
    }

    text += `So far, you've spent ${currency} ${thisMonth.toFixed(2)} in total this month, and your forecast for next month is around ${currency} ${forecast.toFixed(2)}.`;

    return text;
  }, [data, currency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-xl bg-[#0e1420] border border-gray-800/60 shadow-sm p-4"
    >
      <h3 className="text-sm font-semibold text-gray-100 border-b border-gray-700/60 pb-2 mb-3">
        Monthly Summary
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {summary}
      </p>
    </motion.div>
  );
}
