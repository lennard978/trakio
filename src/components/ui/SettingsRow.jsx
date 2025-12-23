import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

/**
 * Reusable row for settings lists
 */
export default function SettingsRow({
  icon,
  title,
  description,
  onClick,
  href,
  to,
  premium = false,
  right = null,
  accent = "orange",
  glow = false,
}) {
  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") || href.startsWith("mailto:"));

  const showChevron = !right && !isExternal;

  const ACCENT_STYLES = {
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  const GLOW_STYLE =
    "shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_0_12px_rgba(249,115,22,0.25)]";


  /* ---------- Shared Icon Wrapper ---------- */
  const IconWrapper = (
    <div
      className={`
    relative flex items-center justify-center
    w-10 h-10 rounded-xl shrink-0
    transition-all duration-200 ease-out
    group-hover:-translate-y-[1px]
    group-hover:scale-[1.03]
    group-hover:shadow-md
+   ${ACCENT_STYLES[accent]}
  `}
    >
      {icon}
      {premium && (
        <span className="absolute -top-1 -left-1 text-xs">👑</span>
      )}
    </div>
  );

  /* ---------- Internal navigation ---------- */
  if (to) {
    return (
      <Link
        to={to}
        className={`
  group w-full flex items-center gap-4 px-4 py-4
  hover:bg-gray-50 dark:hover:bg-gray-800/50
  transition rounded-xl
+ ${glow ? GLOW_STYLE : ""}
`}

      >
        {IconWrapper}

        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>

        {right}
        {showChevron && (
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        )}
      </Link>
    );
  }

  /* ---------- External links ---------- */
  if (href && isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`
  group w-full flex items-center gap-4 px-4 py-4
  hover:bg-gray-50 dark:hover:bg-gray-800/50
  transition rounded-xl
+ ${glow ? GLOW_STYLE : ""}
`}

      >
        {IconWrapper}

        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>

        {right}
        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
      </a>
    );
  }

  /* ---------- Button row ---------- */
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
  group w-full flex items-center gap-4 px-4 py-4
  hover:bg-gray-50 dark:hover:bg-gray-800/50
  transition rounded-xl
+ ${glow ? GLOW_STYLE : ""}
`}

    >
      {IconWrapper}

      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>

      {right}
      {showChevron && (
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}
