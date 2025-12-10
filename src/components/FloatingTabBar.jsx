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
        fixed bottom-4 left-1/2 -translate-x-1/2
        z-50 md:hidden
        px-4 py-2
        rounded-3xl
        bg-white/20 dark:bg-black/20
        backdrop-blur-2xl
        border border-white/30 dark:border-white/10
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        flex items-center justify-around
        w-[90%] max-w-sm
      "
      style={{
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.to);

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`
              flex flex-col items-center justify-center
              text-xs font-medium transition-all
              ${active
                ? "text-blue-600 dark:text-blue-400 scale-110"
                : "text-gray-700 dark:text-gray-300 opacity-80"
              }
            `}
          >
            <span
              className={`
                text-xl mb-0.5 transition-all
                ${active
                  ? "translate-y-[-2px] drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]"
                  : "opacity-80"
                }
              `}
            >
              {tab.icon}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
