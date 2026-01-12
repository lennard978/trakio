import React, { useMemo, useRef } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

export default function ProgressBar({ progress, color = "#22c55e", onClick, daysLeft }) {
  const toastTimeout = useRef(null);

  /* ---------------- Normalize progress ---------------- */
  const safeProgress = useMemo(() => {
    if (typeof progress !== "number" || Number.isNaN(progress)) return 0;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [progress]);

  const isOverdue = typeof daysLeft === "number" && daysLeft < 0;

  /* ---------------- Gradient Logic ---------------- */
  const gradientColor = useMemo(() => {
    if (isOverdue) return "linear-gradient(90deg, #ef4444, #dc2626)";
    if (safeProgress < 50) return "linear-gradient(90deg, #22c55e, #84cc16)";
    if (safeProgress < 80) return "linear-gradient(90deg, #eab308, #f59e0b)";
    return "linear-gradient(90deg, #ef4444, #dc2626)";
  }, [isOverdue, safeProgress]);

  /* ---------------- Handle Click ---------------- */
  const handleClick = () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);

    toastTimeout.current = setTimeout(() => {
      if (typeof daysLeft === "number") {
        toast(
          daysLeft >= 0
            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} until next payment`
            : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`,
          { icon: daysLeft >= 0 ? "⏳" : "⚠️" }
        );
      }
      if (onClick) onClick();
    }, 150);
  };

  return (
    <div>
      <div
        data-no-swipe
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        title={
          typeof daysLeft === "number"
            ? daysLeft >= 0
              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} until next payment`
              : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`
            : "Progress bar"
        }
        className="
          w-full p-3 rounded-full overflow-hidden relative cursor-pointer
          backdrop-blur-md border
          bg-gray-200 dark:bg-gray-700
          border-gray-300 dark:border-white/20
        "
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${safeProgress}%`,
            background: gradientColor,
            boxShadow: `0 0 14px ${isOverdue ? "#ef444480" : `${color}80`}`,
            transition: "width 0.5s ease, box-shadow 0.3s ease",
          }}
        />

        {/* Label */}
        <div
          className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold z-10 pointer-events-none"
          style={{
            color: safeProgress > 50 ? "#fff" : "#1f2937",
            textShadow: safeProgress > 50 ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {safeProgress}%
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func,
  daysLeft: PropTypes.number,
};
