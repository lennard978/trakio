// src/components/ui/ProgressBar.jsx
import React, { useMemo } from "react";
import toast from "react-hot-toast";

export default function ProgressBar({
  progress,
  color = "#22c55e",
  onClick,
  daysLeft,
}) {
  /* ---------------- Normalize progress ---------------- */
  const safeProgress = useMemo(() => {
    if (typeof progress !== "number" || Number.isNaN(progress)) return 0;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [progress]);

  const isOverdue = typeof daysLeft === "number" && daysLeft < 0;

  const handleClick = () => {
    if (typeof daysLeft === "number") {
      toast(
        daysLeft >= 0
          ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} until next payment`
          : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"
          } overdue`,
        { icon: daysLeft >= 0 ? "⏳" : "⚠️" }
      );
    }
    if (onClick) onClick();
  };

  return (
    <div className="relative flex-1">
      <div
        onClick={handleClick}
        className="
          w-full p-3 rounded-full overflow-hidden relative cursor-pointer
          backdrop-blur-md border
          bg-gray-200 dark:bg-gray-700
          border-gray-300 dark:border-white/20
        "
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${safeProgress}%`,
            background: isOverdue
              ? "linear-gradient(90deg, #ef4444, #dc2626)"
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: isOverdue
              ? "0 0 14px #ef444480"
              : `0 0 14px ${color}80`,
          }}
        />

        {/* Label */}
        <div
          className="
            absolute inset-0 flex items-center justify-center
            text-[10px] font-semibold z-10 pointer-events-none
          "
          style={{
            color: safeProgress < 15 ? "#1f2933" : "#000",
          }}
        >
          {safeProgress}%
        </div>
      </div>
    </div>
  );
}
