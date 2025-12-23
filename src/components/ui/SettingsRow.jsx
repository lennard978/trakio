import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

/**
 * Reusable row for settings lists
 * - icon: JSX icon on the left
 * - title: main label
 * - description: secondary text
 * - onClick OR href OR to (internal)
 * - premium: shows crown badge
 * - right: custom right-side UI (e.g., a switch). If provided, chevron is hidden.
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
}) {
  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") || href.startsWith("mailto:"));

  const showChevron = !right && !isExternal;

  // Prefer explicit to= for internal navigation
  if (to) {
    return (
      <Link
        to={to}
        className="
          w-full flex items-center gap-4 px-4 py-4
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition rounded-xl
        "
      >
        <div
          className="
    relative flex items-center justify-center
    w-10 h-10 rounded-xl
    bg-orange-100 dark:bg-orange-900/30
  "
        >
          <div
            className="
    relative flex items-center justify-center
    w-10 h-10 rounded-xl
    bg-orange-50 dark:bg-orange-900/30
    text-orange-600 dark:text-orange-400
  "
          >            {icon}
          </div>

          {premium && (
            <span className="absolute -top-1 -left-1 text-xs">
              👑
            </span>
          )}
        </div>


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

        {right ? right : null}
        {showChevron ? (
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        ) : null}
      </Link>
    );
  }

  // External links
  if (href && isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="
          w-full flex items-center gap-4 px-4 py-4
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition rounded-xl
        "
      >
        <div
          className="
    relative flex items-center justify-center
    w-10 h-10 rounded-xl
    bg-orange-50 dark:bg-orange-900/30
    text-orange-600 dark:text-orange-400
  "
        >          {icon}
          {premium && <span className="absolute -top-1 -left-1 text-xs">👑</span>}
        </div>

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

        {right ? right : null}
        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
      </a>
    );
  }

  // Button row (default)
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
      className="
      w-full flex items-center gap-4 px-4 py-4
      hover:bg-gray-50 dark:hover:bg-gray-800/50
      transition rounded-xl
      cursor-pointer
    "
    >
      <div
        className="
    relative flex items-center justify-center
    w-10 h-10 rounded-xl
    bg-orange-50 dark:bg-orange-900/30
    text-orange-600 dark:text-orange-400
  "
      >        {icon}
        {premium && <span className="absolute -top-1 -left-1 text-xs">👑</span>}
      </div>

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

      {right ? right : null}
      {showChevron ? (
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      ) : null}
    </div>
  );
}
