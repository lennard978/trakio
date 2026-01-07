// src/utils/categoryStyles.js

export const CATEGORY_STYLES = {
  /* ---------------- Core Digital ---------------- */

  streaming: {
    label: "category_streaming",
    icon: "📺",
    ring: "#8b5cf6",
    bgBadge:
      "bg-violet-100 dark:bg-violet-700/60 text-violet-800 dark:text-violet-100",
    bgGradient:
      "bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-violet-500/5 dark:from-violet-400/20 dark:via-violet-400/10 dark:to-violet-400/5",

    // 🧠 Smart metadata
    keywords: ["stream", "music", "video", "tv", "audio"],
    brands: ["netflix", "spotify", "prime", "hbo", "disney", "youtube"],
    priority: 90,
    suggestible: true,
  },

  software: {
    label: "category_software",
    icon: "💻",
    ring: "#3b82f6",
    bgBadge:
      "bg-blue-100 dark:bg-blue-700/60 text-blue-800 dark:text-blue-100",
    bgGradient:
      "bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/5 dark:from-blue-400/20 dark:via-blue-400/10 dark:to-blue-400/5",

    keywords: ["software", "app", "license", "tool", "editor"],
    brands: ["adobe", "figma", "notion", "slack", "jetbrains", "microsoft"],
    priority: 95,
    suggestible: true,
  },

  cloud: {
    label: "category_cloud",
    icon: "☁️",
    ring: "#38bdf8",
    bgBadge:
      "bg-sky-100 dark:bg-sky-700/60 text-sky-800 dark:text-sky-100",
    bgGradient:
      "bg-gradient-to-br from-sky-400/20 via-sky-400/10 to-sky-400/5 dark:from-sky-300/20 dark:via-sky-300/10 dark:to-sky-300/5",

    keywords: ["cloud", "hosting", "server", "storage", "deploy"],
    brands: ["aws", "gcp", "azure", "vercel", "netlify", "digitalocean"],
    priority: 100,
    suggestible: true,
  },

  productivity: {
    label: "category_productivity",
    icon: "🧠",
    ring: "#f59e0b",
    bgBadge:
      "bg-amber-100 dark:bg-amber-700/60 text-amber-800 dark:text-amber-100",
    bgGradient:
      "bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 dark:from-amber-400/20 dark:via-amber-400/10 dark:to-amber-400/5",

    keywords: ["task", "note", "calendar", "todo", "workspace"],
    brands: ["todoist", "asana", "trello", "evernote"],
    priority: 70,
    suggestible: true,
  },

  /* ---------------- Lifestyle ---------------- */

  fitness: {
    label: "category_fitness",
    icon: "💪",
    ring: "#22c55e",
    bgBadge:
      "bg-green-100 dark:bg-green-700/60 text-green-800 dark:text-green-100",
    bgGradient:
      "bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/5 dark:from-green-400/20 dark:via-green-400/10 dark:to-green-400/5",

    keywords: ["gym", "fitness", "workout", "training"],
    brands: ["nike", "peloton", "myfitnesspal"],
    priority: 60,
    suggestible: true,
  },

  food: {
    label: "category_food",
    icon: "🍔",
    ring: "#84cc16",
    bgBadge:
      "bg-lime-100 dark:bg-lime-700/60 text-lime-800 dark:text-lime-100",
    bgGradient:
      "bg-gradient-to-br from-lime-500/20 via-lime-500/10 to-lime-500/5 dark:from-lime-400/20 dark:via-lime-400/10 dark:to-lime-400/5",

    keywords: ["food", "delivery", "meal"],
    brands: ["uber eats", "lieferando", "wolt", "hello fresh"],
    priority: 50,
    suggestible: true,
  },

  entertainment: {
    label: "category_entertainment",
    icon: "🎬",
    ring: "#06b6d4",
    bgBadge:
      "bg-cyan-100 dark:bg-cyan-700/60 text-cyan-800 dark:text-cyan-100",
    bgGradient:
      "bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-cyan-500/5 dark:from-cyan-400/20 dark:via-cyan-400/10 dark:to-cyan-400/5",

    keywords: ["movie", "cinema", "event", "show"],
    brands: ["imax", "eventim"],
    priority: 40,
    suggestible: true,
  },

  /* ---------------- Finance & Essentials ---------------- */

  finance: {
    label: "category_finance",
    icon: "💳",
    ring: "#0ea5e9",
    bgBadge:
      "bg-sky-100 dark:bg-sky-700/60 text-sky-800 dark:text-sky-100",
    bgGradient:
      "bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-sky-500/5 dark:from-sky-400/20 dark:via-sky-400/10 dark:to-sky-400/5",

    keywords: ["bank", "card", "loan", "credit", "payment"],
    brands: ["visa", "mastercard", "klarna", "paypal", "stripe"],
    priority: 85,
    suggestible: true,
  },

  utilities: {
    label: "category_utilities",
    icon: "🔌",
    ring: "#64748b",
    bgBadge:
      "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100",
    bgGradient:
      "bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-slate-500/5 dark:from-slate-400/20 dark:via-slate-400/10 dark:to-slate-400/5",

    keywords: ["electric", "water", "internet", "gas", "energy"],
    brands: ["vodafone", "telekom", "o2"],
    priority: 80,
    suggestible: true,
  },

  insurance: {
    label: "category_insurance",
    icon: "🛡️",
    ring: "#16a34a",
    bgBadge:
      "bg-emerald-100 dark:bg-emerald-700/60 text-emerald-800 dark:text-emerald-100",
    bgGradient:
      "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 dark:from-emerald-400/20 dark:via-emerald-400/10 dark:to-emerald-400/5",

    keywords: ["insurance", "policy", "coverage"],
    brands: ["allianz", "axa", "huk"],
    priority: 75,
    suggestible: true,
  },

  /* ---------------- NEW: Trakio-specific ---------------- */

  ai_tools: {
    label: "category_ai_tools",
    icon: "🤖",
    ring: "#9333ea",
    bgBadge:
      "bg-purple-100 dark:bg-purple-700/60 text-purple-800 dark:text-purple-100",
    bgGradient:
      "bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-purple-500/5 dark:from-purple-400/20 dark:via-purple-400/10 dark:to-purple-400/5",

    keywords: ["ai", "assistant", "model", "automation"],
    brands: ["openai", "chatgpt", "midjourney", "copilot"],
    priority: 100,
    suggestible: true,
  },

  /* ---------------- Fallback ---------------- */

  other: {
    label: "category_other",
    icon: "📦",
    ring: "#14a3b8",
    bgBadge:
      "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
    bgGradient:
      "bg-gradient-to-br from-gray-500/20 via-gray-500/10 to-gray-500/5 dark:from-gray-400/20 dark:via-gray-400/10 dark:to-gray-400/5",

    suggestible: false,
    priority: 0,
  },
};

export function getCategoryStyles(key) {
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.other;
}
