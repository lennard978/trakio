import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiBarChart2, FiPlus, FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";

export default function FloatingTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize tab definitions
  const tabs = useMemo(
    () => [
      { path: "/dashboard", icon: FiHome, label: "Dashboard" },
      { path: "/insights", icon: FiBarChart2, label: "Insights" },
      { path: "/add", icon: FiPlus, label: "Add" },
      { path: "/settings", icon: FiSettings, label: "Settings" },
    ],
    []
  );

  // Hide on specific pages
  if (["/login", "/signup", "/onboarding"].includes(location.pathname)) {
    return null;
  }

  return (
    <motion.nav
      role="tablist"
      aria-label="Main Navigation"
      className="fixed bottom-4 left-3 h-16 -translate-x-1/2 w-[98%] max-w-screen-xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-black/10 backdrop-blur-md flex justify-around items-center py-3 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <motion.button
            key={path}
            role="tab"
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${active ? "text-orange-500 scale-110" : "text-gray-500"
              }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              navigate(path);
            }}
            onKeyDown={(e) => e.key === "Enter" && navigate(path)}
          >
            <Icon className="text-2xl mb-1" />
            <span className="text-[10px] font-medium">{label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
