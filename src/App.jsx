import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import { useTranslation } from "react-i18next";
// import DarkModeToggle from "./components/DarkModeToggle";
// import LanguageSwitcher from "./components/LanguageSwitcher";
import AnimatedPage from "./components/AnimatedPage";
import FloatingTabBar from "./components/FloatingTabBar";
// import LogoIcon from "./icons/icon-192.png";
import CurrencyPickerSheet from "./components/settings/CurrencyPickerSheet";
import LanguagePickerSheet from "./components/settings/LanguagePickerSheet";

import { useAuth } from "./hooks/useAuth";
import { usePremium } from "./hooks/usePremium";

import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { syncPending } from "./utils/syncManager";

/* -------------------- Lazy Pages -------------------- */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddEditSubscription = lazy(() => import("./pages/AddEditSubscription"));
const Settings = lazy(() => import("./pages/Settings"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const TrialExpired = lazy(() => import("./pages/TrialExpired"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Premium = lazy(() => import("./pages/Premium"));
const Widerrufsbelehrung = lazy(() => import("./pages/Widerrufsbelehrung"));
const HelpSupportSheet = lazy(() => import("./components/help/HelpSupportSheet"));
import SyncTestPage from "./pages/SyncTestPage";

import { useCurrency } from "./context/CurrencyContext";
import AGB from "./pages/AGB";

/* -------------------- Loading -------------------- */
function LoadingSkeleton() {
  return (
    <div className="w-full py-10 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <div className="w-40 h-4 bg-gray-300/60 dark:bg-gray-700/60 rounded animate-pulse" />
    </div>
  );
}

/* -------------------- Auth Guard -------------------- */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/* -------------------- Trial Guard -------------------- */
function TrialGuard({ children }) {
  const premium = usePremium();

  if (premium.trialExpired && !premium.isPremium) {
    return <TrialExpired />;
  }
  return children;
}

/* -------------------- App -------------------- */
export default function App() {
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const dir = i18n.dir();
  const { theme } = useTheme();
  const [activeSheet, setActiveSheet] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const email = savedUser ? JSON.parse(savedUser)?.email : null;

    const handleOnline = () => {
      syncPending(email, token);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  /* Currency */
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-gray-100 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
      "
    >
      <Toaster position="top-center" />
      <Analytics />
      {!navigator.onLine && (
        <div className="text-sm text-orange-600 mt-2 text-center">
          ⚠️ You’re offline — changes will sync automatically when online.
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-3 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSkeleton />}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <AnimatedPage><Welcome /></AnimatedPage>
                  )
                }
              />
              <Route path="/premium" element={<AnimatedPage><Premium /></AnimatedPage>} />
              <Route path="/success" element={<AnimatedPage><Success /></AnimatedPage>} />
              <Route path="/cancel" element={<AnimatedPage><Cancel /></AnimatedPage>} />
              <Route path="/impressum" element={<AnimatedPage><Impressum /></AnimatedPage>} />
              <Route path="/datenschutz" element={<AnimatedPage><Datenschutz /></AnimatedPage>} />
              <Route path="/agb" element={<AnimatedPage><AGB /></AnimatedPage>} />
              <Route path="/widerruf" element={<Widerrufsbelehrung />} />
              <Route path="/sync-test" element={<SyncTestPage />} />

              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" /> : <AnimatedPage><Login /></AnimatedPage>}
              />
              <Route
                path="/signup"
                element={user ? <Navigate to="/dashboard" /> : <AnimatedPage><Signup /></AnimatedPage>}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Dashboard currency={currency} />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <TrialGuard>
                      <AnimatedPage>
                        <InsightsPage />
                      </AnimatedPage>
                    </TrialGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AnimatedPage><AddEditSubscription /></AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <AnimatedPage><AddEditSubscription /></AnimatedPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Settings setActiveSheet={setActiveSheet} />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />



              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* FLOATING TAB BAR */}
      <FloatingTabBar hidden={activeSheet !== null} />

      {activeSheet === "currency" && (
        <CurrencyPickerSheet onClose={() => setActiveSheet(null)} />
      )}

      {activeSheet === "language" && (
        <LanguagePickerSheet onClose={() => setActiveSheet(null)} />
      )}

      {activeSheet === "help" && (
        <HelpSupportSheet onClose={() => setActiveSheet(null)} />
      )}


      {/* FOOTER */}
      <div className="fixed bottom-0 w-full flex justify-center bg-gray-300 dark:bg-gray-600 items-center font-bold">
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
          <Link to="/impressum" className="hover:underline">Impressum</Link>
          <span>|</span>
          <Link to="/datenschutz" className="hover:underline">Datenschutz</Link>
          <span>|</span>
          <Link to="/agb" className="hover:underline">AGB</Link>
        </div>
      </div>
    </div>
  );
}
