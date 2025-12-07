import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import DarkModeToggle from "./components/DarkModeToggle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import AnimatedPage from "./components/AnimatedPage";
import LogoIcon from "./icons/icon-192.png";
import { useAuth } from "./hooks/useAuth";
import { usePremiumContext } from "./context/PremiumContext";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const AddEditSubscription = lazy(() =>
  import("./pages/AddEditSubscription")
);
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const TrialExpired = lazy(() => import("./pages/TrialExpired"));
const Welcome = lazy(() => import("./pages/Welcome"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
import { Analytics } from "@vercel/analytics/react"
// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="w-full py-10 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <div className="w-40 h-4 bg-gray-300/60 dark:bg-gray-700/60 rounded animate-pulse" />
      <div className="w-28 h-4 bg-gray-300/60 dark:bg-gray-700/60 rounded animate-pulse" />
    </div>
  );
}

// Protected route
function ProtectedRoute({ children }) {
  const { user, isTrialExpired } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;

  if (isTrialExpired && !location.pathname.startsWith("/settings"))
    return <Navigate to="/trial-expired" replace />;

  return children;
}

// Mobile bottom tab bar
function MobileTabBar({ user, dir }) {
  const { t } = useTranslation();
  const location = useLocation();

  if (!user) return null;

  const isRTL = dir === "rtl";

  const tabs = [
    { to: "/dashboard", label: t("dashboard_title"), icon: "🏠" },
    { to: "/add", label: t("add_subscription"), icon: "➕" },
    { to: "/settings", label: t("settings_title"), icon: "⚙️" },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-30 md:hidden
        bg-white/90 dark:bg-gray-900/90
        border-t border-gray-200 dark:border-gray-800
        backdrop-blur-md
      "
    >
      <div
        className={`flex justify-around items-stretch ${isRTL ? "flex-row-reverse" : "flex-row"
          }`}
      >
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`
                flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium
                transition-all duration-200
                ${active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                }
              `}
            >
              <span
                className={`
                  text-lg mb-0.5 transition-transform
                  ${active ? "scale-110" : "scale-95 opacity-80"}
                `}
              >
                {tab.icon}
              </span>
              <span className="truncate max-w-[80px]">{tab.label}</span>
              {active && (
                <span className="mt-1 h-0.5 w-8 rounded-full bg-blue-500 dark:bg-blue-400" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();
  const premium = usePremiumContext();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    setTransitionKey((prev) => prev + 1);
  }, [i18n.language, location.pathname]);

  useEffect(() => {
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n.language]);

  const dir = i18n.dir();
  const directionClass =
    dir === "rtl" ? "route-transition-rtl" : "route-transition-ltr";

  return (
    <div
      className={`
        min-h-screen flex flex-col
        bg-gray-100 dark:bg-gray-900 
        text-gray-900 dark:text-gray-100
        transition-colors duration-300
        ${dir === "rtl" ? "text-right" : "text-left"}
      `}
    >
      <Analytics />
      {/* HEADER */}
      <header className="w-full sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img src={LogoIcon} alt="Logo" className="h-12 w-12 mr-2" />
          </Link>

          <div className="flex items-center gap-3">
            {premium.isPremium ? (
              <span className="px-2 py-1 text-xs bg-yellow-400 text-black rounded-md font-semibold shadow">
                {t("premium_button")}
              </span>
            ) : (
              <button
                onClick={() => navigate("/premium")}
                className="
                  px-3 py-1 text-xs 
                  bg-yellow-400 text-black 
                  rounded-md font-semibold shadow 
                  hover:bg-yellow-300 
                  transition active:scale-95
                "
              >
                {t("premium_upgrade")}
              </button>
            )}

            <DarkModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-2 pb-16 md:pb-4">
        <div
          key={transitionKey}
          className={`transition-opacity duration-500 ${directionClass}`}
        >
          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/trial-expired" element={<TrialExpired />} />

              {/* Auth */}
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" replace /> : <Login />}
              />
              <Route
                path="/signup"
                element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
              />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Dashboard />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <AddEditSubscription />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <AddEditSubscription />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Settings />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <MobileTabBar user={user} dir={dir} />

      <footer className="hidden md:block w-full border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-4xl mx-auto px-4 py-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>© {new Date().getFullYear()} Subscription Tracker</span>
          <span>PWA · Offline first · Privacy focus</span>
        </div>
      </footer>
    </div>
  );
}
