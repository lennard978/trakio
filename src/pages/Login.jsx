// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast(t("error_required"), "error");
      return;
    }

    try {
      await login(email, password);
      showToast(t("toast_login_success"), "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(t("login_failed"), "error");
    }
  };

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 
      bg-white dark:bg-gray-900 rounded-xl shadow-lg 
      border border-gray-200 dark:border-gray-800">

        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t("login_title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              {t("login_email")}
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md 
              border border-gray-300 dark:border-gray-700 
              dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              {t("login_password")}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md 
              border border-gray-300 dark:border-gray-700 
              dark:bg-gray-800 dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {t("button_log_in")}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          {t("login_no_account")}{" "}
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/signup">
            {t("login_signup_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
