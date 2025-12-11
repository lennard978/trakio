// src/components/ui/ProgressBar.jsx
import React from "react";
import toast from "react-hot-toast";

export default function ProgressBar({ progress, color, onClick, daysLeft }) {
  const handleClick = () => {
    if (typeof daysLeft === "number") {
      toast(`${daysLeft} day${daysLeft === 1 ? "" : "s"} until next payment`, {
        icon: "⏳",
      });
    }
    if (onClick) onClick();
  };

  return (
    <div className="relative flex-1">
      <div
        className="
          w-full p-3 rounded-full overflow-hidden relative cursor-pointer
          backdrop-blur-md border
          bg-gray-200 dark:bg-gray-700
          border-gray-300 dark:border-white/20
        "
        onClick={handleClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 14px ${color}80`,
          }}
        />

        <div
          className="
            absolute inset-0 flex items-center justify-center
            text-[10px] font-semibold z-10 pointer-events-none
          "
          style={{
            color: progress < 10 ? "#1f2933" : "#000",
          }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
