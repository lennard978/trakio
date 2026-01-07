
import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import AnimatedPage from "./components/AnimatedPage";
import FloatingTabBar from "./components/FloatingTabBar";
import CurrencyPickerSheet from "./components/settings/CurrencyPickerSheet";
import LanguagePickerSheet from "./components/settings/LanguagePickerSheet";

import { useAuth } from "./hooks/useAuth";

import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { flushQueue } from "./utils/offlineQueue";
import toast from "react-hot-toast";

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
const AGB = lazy(() => import("./pages/AGB"));
const AccountDeleted = lazy(() => import("./pages/AccountDeleted"));

import InstallBanner from "./components/InstallBanner";
import { useAppUpdate } from "./hooks/useAppUpdate";
import AppUpdateBanner from "./components/AppUpdateBanner";
import DashboardLoading from "./components/dasboard/DashboardLoading";
import OfflineNotice from "./components/dasboard/OfflineNotice";
import ProtectedRoute from "./components/ProtectedRoute";
import TrialGuard from "./components/TrialGuard";
import HardErrorBoundary from './components/HardErrorBoundary'
import NotFound from "./pages/NotFound";

/* -------------------- App -------------------- */
export default function App() {
  const { user } = useAuth();
  const [activeSheet, setActiveSheet] = useState(null);
  const location = useLocation();
  const { updateAvailable, applyUpdate } = useAppUpdate();

  useEffect(() => {
    const syncIfOnline = async () => {
      const token = localStorage.getItem("token");
      const isOnline = navigator.onLine;

      if (token && isOnline && user) {
        try {
          await flushQueue();
          toast.success("All offline changes synced!");
        } catch (error) {
          console.error("Queue flush failed:", error);
          toast.error("Some changes couldn't be synced. Retrying soon.");
        }

      }
    };

    const onOffline = () => {
      toast("You are offline. Changes will be synced once you reconnect.", {
        icon: "⚠️",
      });
    };

    // Run once and attach listeners
    syncIfOnline();
    window.addEventListener("online", syncIfOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", syncIfOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [user]);


  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-gray-100 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
      "
    >
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Analytics />
      <InstallBanner />
      {/* MAIN */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-3 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <HardErrorBoundary>
            <Suspense fallback={<DashboardLoading />}>
              <Routes location={location}>
                {/* Public */}
                <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <AnimatedPage><Welcome /></AnimatedPage>} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AnimatedPage><Login /></AnimatedPage>} />
                <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <AnimatedPage><Signup /></AnimatedPage>} />

                {/* Authenticated */}
                <Route path="/dashboard" element={<ProtectedRoute><AnimatedPage><Dashboard /></AnimatedPage></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute><AnimatedPage><AddEditSubscription /></AnimatedPage></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><AnimatedPage><AddEditSubscription /></AnimatedPage></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AnimatedPage><Settings setActiveSheet={setActiveSheet} /></AnimatedPage></ProtectedRoute>} />

                {/* Premium */}
                <Route path="/insights" element={<ProtectedRoute><TrialGuard><AnimatedPage><InsightsPage /></AnimatedPage></TrialGuard></ProtectedRoute>} />
                <Route path="/trial-expired" element={<AnimatedPage><TrialExpired /></AnimatedPage>} />
                <Route path="/premium" element={<ProtectedRoute><AnimatedPage><Premium /></AnimatedPage></ProtectedRoute>} />
                <Route path="/success" element={<ProtectedRoute>  <AnimatedPage><Success /></AnimatedPage> </ProtectedRoute>} />
                <Route path="/cancel" element={<ProtectedRoute><AnimatedPage><Cancel /></AnimatedPage></ProtectedRoute>} />

                {/* Legal */}
                <Route path="/impressum" element={<AnimatedPage><Impressum /></AnimatedPage>} />
                <Route path="/datenschutz" element={<AnimatedPage><Datenschutz /></AnimatedPage>} />
                <Route path="/agb" element={<AnimatedPage><AGB /></AnimatedPage>} />
                <Route path="/widerruf" element={<Widerrufsbelehrung />} />
                <Route path="/account-deleted" element={<AccountDeleted />} />

                {/* Catch-All */}
                <Route path="*" element={navigator.onLine ? (<AnimatedPage><NotFound /></AnimatedPage>) : (<AnimatedPage><OfflineNotice /></AnimatedPage>)} />
              </Routes>
            </Suspense>
          </HardErrorBoundary>
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

      {updateAvailable && (
        <AppUpdateBanner onUpdate={applyUpdate} />
      )}
    </div>
  );
}
