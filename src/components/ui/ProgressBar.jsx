// src/components/ui/ProgressBar.jsx
import React from "react";

export default function ProgressBar({
  progress,
  color,
  onClick,
}) {
  return (
    <div className="relative flex-1">
      <div
        className="
          w-full px-4 py-1.5 rounded-full overflow-hidden relative cursor-pointer
          backdrop-blur-md border
          bg-gray-200 dark:bg-gray-700
          border-gray-300 dark:border-white/20
        "
        onClick={onClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 14px ${color}80`,
          }}
        />

        {/* Center % */}
        <div
          className="
            absolute inset-0 flex items-center justify-center
            text-[10px] font-semibold z-10 pointer-events-none
          "
          style={{
            color: progress < 10 ? "#000" : "#1f2933",
          }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
