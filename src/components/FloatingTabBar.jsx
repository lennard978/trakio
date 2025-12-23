// src/components/FloatingTabBar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export default function FloatingTabBar({ dir = "ltr" }) {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Hide when not logged in
  if (!user) return null;

  const isRTL = dir === "rtl";

  const tabs = [
    { to: "/dashboard", label: t("tab_home"), icon: "🏠" },
    { to: "/insights", label: t("tab_insights"), icon: "📊" },
    { to: "/add", label: t("tab_add"), icon: "➕" },
    { to: "/settings", label: t("tab_settings"), icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2
          z-50 md:hidden
          w-[96%]
          px-4 py-2
          rounded-full
          bg-white/90 dark:bg-slate-950/85
          backdrop-blur-xl
          border border-gray-200/80 dark:border-slate-700/70
          shadow-[0_6px_20px_rgba(15,23,42,0.22)]
          flex items-center justify-between
        `}
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex-1 flex justify-center"
          >
            {({ isActive }) => (
              <div
                className={`relative flex flex-col items-center justify-center text-[11px] font-medium transition-all duration-200 ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                <span
                  className={`text-[20px] mb-0.5 transition-transform duration-200 ${isActive
                    ? "scale-110 -translate-y-0.5"
                    : "scale-95 translate-y-0"
                    }`}
                >
                  {tab.icon}
                </span>
                <span className="truncate max-w-[60px]">{tab.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`
          hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-screen
          md:w-20 lg:w-24 xl:w-28
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
          pt-6 items-center z-40
        `}
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="w-full flex flex-col items-center py-4"
          >
            {({ isActive }) => (
              <div
                className={`flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                <span
                  className={`text-xl mb-1 transition-transform ${isActive ? "scale-110" : "scale-95"
                    }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] text-center">{tab.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </aside>
    </>
  );
}
