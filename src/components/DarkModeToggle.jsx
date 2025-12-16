// src/components/DarkModeToggle.jsx
import React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "@/hooks/useTheme.js"

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="
        w-10 h-10 flex items-center justify-center
        rounded-2xl
        bg-white/20 dark:bg-black/20
        backdrop-blur-xl
        border border-white/30 dark:border-white/10
        shadow-[0_8px_20px_rgba(0,0,0,0.25)]
        transition-all active:scale-95
      "
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-yellow-300 transition-all duration-300 scale-110" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-600 transition-all duration-300 scale-110" />
      )}
    </button>
  );
}
