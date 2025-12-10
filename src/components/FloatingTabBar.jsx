// src/components/FloatingTabBar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export default function FloatingTabBar({ dir = "ltr" }) {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (!user) return null;

  const isRTL = dir === "rtl";

  const tabs = [
    { to: "/dashboard", label: t("tab_home"), icon: "🏠" },
    { to: "/insights", label: t("tab_insights"), icon: "📊" },
    { to: "/add", label: t("tab_add"), icon: "➕" },
    { to: "/settings", label: t("tab_settings"), icon: "⚙️" },
  ];

  return (
    <nav
      className="
        fixed bottom-3 left-1/2 -translate-x-1/2
        w-[94%] max-w-md
        rounded-3xl
        px-4 py-2
        z-50 md:hidden
        bg-white/85 dark:bg-gray-900/70
        backdrop-blur-xl
        border border-gray-300/60 dark:border-white/10
        shadow-[0_8px_28px_rgba(0,0,0,0.35)]
        flex items-center justify-between
      "
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="flex-1 flex justify-center"
        >
          {({ isActive }) => (
            <div
              className={`
                relative flex flex-col items-center justify-center
                text-[12px] font-medium
                transition-all duration-200

                ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
                }
              `}
            >
              {/* Active spotlight */}
              {isActive && (
                <div
                  className="
                    absolute -top-1
                    w-10 h-10
                    rounded-full
                    bg-blue-500/15
                    blur-xl
                  "
                />
              )}

              {/* Icon */}
              <span
                className={`
                  relative z-10 
                  text-[22px] mb-0.5
                  transition-all duration-200
                  ${isActive ? "scale-110 -translate-y-0.5" : "opacity-80"}
                `}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span className="relative z-10">
                {tab.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
