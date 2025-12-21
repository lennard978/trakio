// src/utils/categoryStyles.js

export const CATEGORY_STYLES = {
  streaming: {
    label: "category_streaming",
    icon: "📺",
    ring: "#8b5cf6",
    bgBadge:
      "bg-purple-100 dark:bg-purple-700/60 text-purple-800 dark:text-purple-100",
    bgGradient:
      "bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-purple-500/5 dark:from-purple-400/20 dark:via-purple-400/10 dark:to-purple-400/5",
  },

  fitness: {
    label: "category_fitness",
    icon: "💪",
    ring: "#22c55e",
    bgBadge:
      "bg-green-100 dark:bg-green-700/60 text-green-800 dark:text-green-100",
    bgGradient:
      "bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/5 dark:from-green-400/20 dark:via-green-400/10 dark:to-green-400/5",
  },

  software: {
    label: "category_software",
    icon: "💻",
    ring: "#3b82f6",
    bgBadge:
      "bg-blue-100 dark:bg-blue-700/60 text-blue-800 dark:text-blue-100",
    bgGradient:
      "bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/5 dark:from-blue-400/20 dark:via-blue-400/10 dark:to-blue-400/5",
  },

  productivity: {
    label: "category_productivity",
    icon: "🧠",
    ring: "#f59e0b",
    bgBadge:
      "bg-amber-100 dark:bg-amber-700/60 text-amber-800 dark:text-amber-100",
    bgGradient:
      "bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 dark:from-amber-400/20 dark:via-amber-400/10 dark:to-amber-400/5",
  },

  gaming: {
    label: "category_gaming",
    icon: "🎮",
    ring: "#ef4444",
    bgBadge: "bg-red-100 dark:bg-red-700/60 text-red-800 dark:text-red-100",
    bgGradient:
      "bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/5 dark:from-red-400/20 dark:via-red-400/10 dark:to-red-400/5",
  },

  bills: {
    label: "category_bills",
    icon: "📄",
    ring: "#6366f1",
    bgBadge:
      "bg-indigo-100 dark:bg-indigo-700/60 text-indigo-800 dark:text-indigo-100",
    bgGradient:
      "bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-indigo-500/5 dark:from-indigo-400/20 dark:via-indigo-400/10 dark:to-indigo-400/5",
  },

  education: {
    label: "category_education",
    icon: "📚",
    ring: "#14b8a6",
    bgBadge:
      "bg-teal-100 dark:bg-teal-700/60 text-teal-800 dark:text-teal-100",
    bgGradient:
      "bg-gradient-to-br from-teal-500/20 via-teal-500/10 to-teal-500/5 dark:from-teal-400/20 dark:via-teal-400/10 dark:to-teal-400/5",
  },

  transport: {
    label: "category_transport",
    icon: "🚗",
    ring: "#f97316",
    bgBadge:
      "bg-orange-100 dark:bg-orange-700/60 text-orange-800 dark:text-orange-100",
    bgGradient:
      "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-orange-500/5 dark:from-orange-400/20 dark:via-orange-400/10 dark:to-orange-400/5",
  },

  food: {
    label: "category_food",
    icon: "🍔",
    ring: "#84cc16",
    bgBadge:
      "bg-lime-100 dark:bg-lime-700/60 text-lime-800 dark:text-lime-100",
    bgGradient:
      "bg-gradient-to-br from-lime-500/20 via-lime-500/10 to-lime-500/5 dark:from-lime-400/20 dark:via-lime-400/10 dark:to-lime-400/5",
  },

  other: {
    label: "category_other",
    icon: "📦",
    ring: "#64748b",
    bgBadge:
      "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100",
    bgGradient:
      "bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-slate-500/5 dark:from-slate-400/20 dark:via-slate-400/10 dark:to-slate-400/5",
  },
};

export function getCategoryStyles(key) {
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.other;
}
