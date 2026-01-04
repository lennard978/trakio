// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast(t("error_required"), "error");
      return;
    }

    if (!password.trim()) {
      showToast(t("error_required"), "error");
      return;
    }


    try {
      await login(email, password);
      showToast(t("toast_login_success"), "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(t("login_failed") || "Login failed", "error");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center mt-12 px-4 pb-24">
      <div className="max-w-md w-full">
        <Card>
          <h1 className="text-2xl font-semibold text-center mb-6">
            {t("login_title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("login_email")}
              </label>
              <input
                type="email"
                className="
                  w-full px-3 py-2 rounded-xl
                  bg-white/80 dark:bg-gray-900/60
                  border border-gray-300/70 dark:border-gray-600
                  shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                  transition
                "
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("login_password")}
              </label>
              <input
                type="password"
                className="
                  w-full px-3 py-2 rounded-xl
                  bg-white/80 dark:bg-gray-900/60
                  border border-gray-300/70 dark:border-gray-600
                  shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                  transition
                "
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <SettingButton type="submit" variant="primary">
              {t("button_log_in")}
            </SettingButton>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
            {t("login_no_account")}{" "}
            <Link
              to="/signup"
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              {t("login_signup_link")}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
