// src/components/FloatingTabBar.jsx
import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

// Must match AnimatedPage swipeablePages array
const swipeablePages = ["/dashboard", "/insights", "/add", "/settings"];

export default function FloatingTabBar({ dir = "ltr" }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const directionRef = useRef(0);

  if (!user) return null;

  const isRTL = dir === "rtl";

  const tabs = [
    { to: "/dashboard", label: t("tab_home"), icon: "🏠" },
    { to: "/insights", label: t("tab_insights"), icon: "📊" },
    { to: "/add", label: t("tab_add"), icon: "➕" },
    { to: "/settings", label: t("tab_settings"), icon: "⚙️" },
  ];

  const handleNav = (target) => {
    const currentIndex = swipeablePages.indexOf(location.pathname);
    const nextIndex = swipeablePages.indexOf(target);

    // Determine direction (for AnimatedPage animation)
    directionRef.current = nextIndex > currentIndex ? 1 : -1;
    navigate(target);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`
          fixed bottom-4 left-1/2 -translate-x-1/2
          z-50 md:hidden
          w-[98%]
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
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <button
              key={tab.to}
              onClick={() => handleNav(tab.to)}
              className="flex-1 flex flex-col items-center justify-center text-[11px] font-medium"
            >
              <span
                className={`text-[20px] mb-0.5 transition-transform duration-200 ${isActive ? "scale-110 -translate-y-0.5 text-blue-600 dark:text-blue-400" : "scale-95 text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                {tab.icon}
              </span>
              <span
                className={`truncate max-w-[60px] transition-colors duration-200 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
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
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <button
              key={tab.to}
              onClick={() => handleNav(tab.to)}
              className="w-full flex flex-col items-center py-4"
            >
              <span
                className={`text-xl mb-1 transition-transform ${isActive ? "scale-110 text-blue-600 dark:text-blue-400" : "scale-95 text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] text-center ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 opacity-85"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </aside>
    </>
  );
}
