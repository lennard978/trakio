// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Signup() {
  const { signup } = useAuth();
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

    if (!email.includes("@")) {
      showToast(t("error_email_invalid"), "error");
      return;
    }

    if (password.length < 6) {
      showToast(t("error_password_short"), "error");
      return;
    }

    try {
      await signup(email, password);
      showToast(t("toast_signup_success"), "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(t("signup_failed") || "Signup failed", "error");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center mt-12 px-4 pb-24">
      <div className="max-w-md w-full">
        <Card>
          <h1 className="text-2xl font-semibold text-center mb-6">
            {t("signup_title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("signup_email")}
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
                {t("signup_password")}
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
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <SettingButton type="submit" variant="primary">
              {t("signup_button")}
            </SettingButton>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
            {t("signup_have_account")}{" "}
            <Link
              to="/login"
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              {t("signup_login_link")}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
