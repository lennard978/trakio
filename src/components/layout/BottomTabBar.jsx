// src/components/layout/BottomTabBar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default function BottomTabBar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", icon: HomeIcon, label: "Home" },
    { to: "/insights", icon: ChartPieIcon, label: "Insights" },
    { to: "/add", icon: PlusCircleIcon, label: "Add" },
    { to: "/settings", icon: Cog6ToothIcon, label: "Settings" },
  ];

  // Hide bar on auth & welcome pages if you want:
  const hiddenOn = ["/login", "/signup", "/welcome"];
  if (hiddenOn.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 flex justify-center z-40 pointer-events-none">
      <nav
        className="
          pointer-events-auto
          flex items-center justify-around
          w-[90%] max-w-md
          px-4 py-2
          rounded-3xl
          bg-white/90 dark:bg-black/40
          backdrop-blur-2xl
          border border-gray-200/70 dark:border-white/10
          shadow-[0_10px_40px_rgba(0,0,0,0.25)]
        "
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `
              flex flex-col items-center gap-0.5 text-[11px]
              transition
              ${isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
              }
            `
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    flex items-center justify-center
                    w-9 h-9 rounded-full
                    ${isActive
                      ? "bg-blue-100/90 dark:bg-blue-500/20 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                      : "bg-transparent"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
