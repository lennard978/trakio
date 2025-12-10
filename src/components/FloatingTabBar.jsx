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

  const tabs = [
    { to: "/dashboard", label: t("tab_home"), icon: "🏠" },
    { to: "/insights", label: t("tab_insights"), icon: "📊" },
    { to: "/add", label: t("tab_add"), icon: "➕" },
    { to: "/settings", label: t("tab_settings"), icon: "⚙️" },
  ];

  return (
    <nav
      className="
        fixed
        bottom-[env(safe-area-inset-bottom,16px)]
        left-1/2 -translate-x-1/2
        z-50 md:hidden
        w-[92vw] max-w-[380px]
        
        px-4 py-2
        rounded-full
        
        bg-white/15 dark:bg-black/25
        backdrop-blur-2xl
        border border-white/25 dark:border-white/10
        shadow-[0_14px_40px_rgba(0,0,0,0.45)]
        
        flex items-center justify-between
        pointer-events-auto
      "
      style={{ direction: dir === "rtl" ? "rtl" : "ltr" }}
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="flex-1 flex justify-center">
          {({ isActive }) => (
            <div
              className={`
                relative flex flex-col items-center justify-center
                text-[11px] font-medium transition-all
                ${isActive
                  ? "text-blue-500 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 opacity-85"
                }
              `}
            >
              <div
                className={`
                  absolute inset-0 mx-auto
                  w-10 h-8 rounded-2xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-white/55 dark:bg-white/10 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                    : "bg-transparent shadow-none"
                  }
                `}
              />
              <span
                className={`
                  relative z-10 text-[20px] mb-0.5
                  transition-transform duration-200
                  ${isActive ? "scale-110 -translate-y-0.5" : "scale-95 translate-y-0"}
                `}
              >
                {tab.icon}
              </span>
              <span className="relative z-10 truncate max-w-[60px]">
                {tab.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
