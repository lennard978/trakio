// src/components/FloatingTabBar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence mode="wait">
      <motion.nav
        key={location.pathname}
        initial={{ y: 10, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.25,
            ease: [0.24, 0.12, 0.12, 0.98],
          },
        }}
        exit={{
          y: 10,
          opacity: 0,
          transition: { duration: 0.18 },
        }}
        className="
          fixed bottom-4 left-1/2 -translate-x-1/2
          z-50 md:hidden
          w-[90%] max-w-sm
          px-4 py-2
          rounded-full
          bg-white/20 dark:bg-black/25
          backdrop-blur-2xl
          border border-white/30 dark:border-white/10
          shadow-[0_12px_45px_rgba(0,0,0,0.35)]
          flex items-center justify-between
        "
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {tabs.map((tab) => {
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex-1 flex justify-center"
            >
              {({ isActive }) => (
                <div
                  className={`
                    relative flex flex-col items-center justify-center
                    text-[11px] font-medium transition-all duration-200

                    ${isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 opacity-85"
                    }
                  `}
                >
                  {/* Active glass pill */}
                  <div
                    className={`
                      absolute inset-0 mx-auto w-10 h-8 rounded-2xl
                      transition-all duration-300

                      ${isActive
                        ? "bg-white/60 dark:bg-white/10 shadow-[0_0_14px_rgba(37,99,235,0.45)]"
                        : "bg-transparent shadow-none"
                      }
                    `}
                  />

                  {/* Icon */}
                  <span
                    className={`
                      relative z-10 text-[20px] transition-all duration-200

                      ${isActive
                        ? "scale-110 -translate-y-0.5"
                        : "scale-95 translate-y-0 opacity-90"
                      }
                    `}
                  >
                    {tab.icon}
                  </span>

                  {/* Label */}
                  <span className="relative z-10 truncate max-w-[60px]">
                    {tab.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </motion.nav>
    </AnimatePresence>
  );
}
