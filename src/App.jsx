// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useTranslation } from "react-i18next";
import DarkModeToggle from "./components/DarkModeToggle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import AnimatedPage from "./components/AnimatedPage";
import LogoIcon from "./icons/icon-192.png";
import { useAuth } from "./hooks/useAuth";
import { usePremiumContext } from "./context/PremiumContext";
import { Analytics } from "@vercel/analytics/react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddEditSubscription = lazy(() =>
  import("./pages/AddEditSubscription")
);
const Settings = lazy(() => import("./pages/Settings"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const TrialExpired = lazy(() => import("./pages/TrialExpired"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));

function LoadingSkeleton() {
  return (
    <div className="w-full py-10 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <div className="w-40 h-4 bg-gray-300/60 dark:bg-gray-700/60 rounded animate-pulse" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isTrialExpired } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" replace />;

  if (isTrialExpired && !location.pathname.startsWith("/settings"))
    return <Navigate to="/trial-expired" replace />;

  return children;
}

// 4-TAB MOBILE BAR with micro-animations
function MobileTabBar({ dir }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

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
        fixed bottom-0 left-0 right-0 z-30 md:hidden
        bg-white/90 dark:bg-gray-900/90
        border-t border-gray-200 dark:border-gray-800
        backdrop-blur-md
      "
    >
      <div
        className={`flex justify-around items-stretch ${isRTL ? "flex-row-reverse" : ""
          }`}
      >
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`
                mobile-tab flex flex-col items-center justify-center flex-1 py-2
                text-xs font-medium relative
                ${active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                }
              `}
            >
              <span
                className={`
                  text-lg mb-0.5 transition-transform duration-200
                  ${active
                    ? "scale-110 translate-y-[-2px]"
                    : "scale-95 opacity-80"
                  }
                `}
              >
                {tab.icon}
              </span>
              <span className="truncate max-w-[80px]">{tab.label}</span>
              {active && (
                <span className="tab-pill absolute -top-1 h-1 w-10 rounded-full bg-blue-500/90 dark:bg-blue-400/90" />
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

  const dir = i18n.dir();

  return (
    <div
      className={`
        min-h-screen flex flex-col
        bg-gray-100 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
      `}
    >
      <Analytics />

      {/* HEADER with subtle animation */}
      <header
        className="
          app-header
          w-full sticky top-0 z-20
          border-b border-gray-200 dark:border-gray-800
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-md
        "
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <img
              src={LogoIcon}
              alt="Logo"
              className="h-10 w-10 rounded-xl shadow-sm"
            />
            <span className="hidden sm:inline text-sm font-semibold text-gray-800 dark:text-gray-100">
              Subscription Tracker
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {premium.isPremium ? (
              <span className="px-2 py-1 text-xs bg-yellow-400 text-black rounded-md font-semibold shadow">
                PREMIUM
              </span>
            ) : (
              <Link
                to="/premium"
                className="
                  px-3 py-1 text-xs 
                  bg-yellow-400 text-black 
                  rounded-md font-semibold shadow 
                  hover:bg-yellow-300 
                  transition active:scale-95
                "
              >
                UPGRADE
              </Link>
            )}

            <DarkModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* MAIN ROUTER AREA – same neutral background on all pages */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-3 pb-20 md:pb-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<AnimatedPage><Welcome /></AnimatedPage>} />
            <Route
              path="/premium"
              element={
                <AnimatedPage>
                  <PremiumPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/success"
              element={
                <AnimatedPage>
                  <Success />
                </AnimatedPage>
              }
            />
            <Route
              path="/cancel"
              element={
                <AnimatedPage>
                  <Cancel />
                </AnimatedPage>
              }
            />
            <Route
              path="/trial-expired"
              element={
                <AnimatedPage>
                  <TrialExpired />
                </AnimatedPage>
              }
            />

            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <AnimatedPage>
                    <Login />
                  </AnimatedPage>
                )
              }
            />
            <Route
              path="/signup"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <AnimatedPage>
                    <Signup />
                  </AnimatedPage>
                )
              }
            />

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
              path="/insights"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <InsightsPage />
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

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>

      <MobileTabBar dir={dir} />
    </div>
  );
}
